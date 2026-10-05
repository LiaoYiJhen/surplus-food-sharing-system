const express = require('express');
const router = express.Router();
const db = require('../db');

// ================== NEARBY SEARCH (LIGHT VERSION) ==================
// use Case 5：Search Surplus Food
// 接收RecipientController.js傳來的座標
router.get('/nearby', async (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({
      success: false,
      message: '請提供定位資訊'
    });
  }
  //系統根據定位搜尋符合條件(五公里內)的附近剩食
  //顯示提供者資訊及剩食資料
  try {
    const sql = `
      SELECT
        sf.food_id,
        sf.food_name,
        sf.quantity,
        sf.original_price,
        sf.discount,
        ROUND(sf.original_price * sf.discount::numeric, 2) AS final_price,

        p.store_name,
        p.address,
        p.latitude,
        p.longitude,

        ROUND(
          (6371 * 2 * ASIN(
            SQRT(
              POWER(SIN(RADIANS(p.latitude - $1) / 2), 2) +
              COS(RADIANS($1)) * COS(RADIANS(p.latitude)) *
              POWER(SIN(RADIANS(p.longitude - $2) / 2), 2)
            )
          ))::numeric
        , 2) AS distance_km

      FROM surplus_food sf
      JOIN providers p ON sf.provider_id = p.id
      WHERE sf.quantity > 0
      ORDER BY distance_km ASC
    `;
    // 執行SQL查詢，傳入領取者的座標
    const result = await db.query(sql, [lat, lng]);
    // 篩選五公里內的剩食。
    const nearby = result.rows.filter(item => item.distance_km <= 5);
    // 回傳查詢結果給前端
    return res.json({
      success: true,
      data: nearby
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: '查詢失敗'
    });
  }
});

module.exports = router;