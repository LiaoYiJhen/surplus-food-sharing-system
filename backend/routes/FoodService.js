const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth.middleware');

// ================== CREATE FOOD (provider only) ==================
router.post('/', authMiddleware, async (req, res) => {
  const { food_name, quantity, original_price, discount } = req.body;

  if (req.user.role !== 'provider') {
    return res.status(403).json({
      success: false,
      message: '只有提供者可以上架剩食'
    });
  }

  if (!food_name || quantity === undefined || !original_price || !discount) {
    return res.status(400).json({
      success: false,
      message: '請填寫所有欄位'
    });
  }

  try {
    const providerRes = await db.query(
      'SELECT id FROM providers WHERE member_id = $1',
      [req.user.id]
    );

    if (providerRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '找不到 provider'
      });
    }

    const providerId = providerRes.rows[0].id;
    const foodId = 'F' + Date.now();

    await db.query(
      `INSERT INTO surplus_food
        (food_id, provider_id, food_name, quantity, original_price, discount)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [foodId, providerId, food_name, quantity, original_price, discount]
    );

    return res.json({
      success: true,
      message: '新增成功',
      foodId
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: '新增失敗'
    });
  }
});


// ================== PROVIDER OWN FOOD LIST ==================
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const providerRes = await db.query(
      'SELECT id FROM providers WHERE member_id = $1',
      [req.user.id]
    );

    if (providerRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '找不到 provider'
      });
    }

    const providerId = providerRes.rows[0].id;

    const result = await db.query(
      `SELECT * 
       FROM surplus_food
       WHERE provider_id = $1
       ORDER BY created_at ASC`,
      [providerId]
    );

    return res.json({
      success: true,
      data: result.rows
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    });
  }
});


// ================== PUBLIC FOOD LIST ==================
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT sf.*, p.store_name, p.address
       FROM surplus_food sf
       JOIN providers p ON sf.provider_id = p.id
       WHERE sf.quantity > 0
       ORDER BY sf.created_at DESC`
    );

    return res.json({
      success: true,
      data: result.rows
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: '查詢失敗'
    });
  }
});


// ================== UPDATE QUANTITY ONLY ==================
router.patch('/:foodId/quantity', authMiddleware, async (req, res) => {
  const { foodId } = req.params;
  const { quantity } = req.body;

  if (quantity === undefined || quantity < 0) {
    return res.status(400).json({
      success: false,
      message: '數量格式錯誤'
    });
  }

  try {
    await db.query(
      `UPDATE surplus_food
       SET quantity = $1
       WHERE food_id = $2`,
      [quantity, foodId]
    );

    return res.json({
      success: true,
      message: quantity === 0 ? '庫存為 0' : '更新成功'
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: '更新失敗'
    });
  }
});


// ================== NEARBY FOOD (RECIPIENT) ==================
//同searchService.js中註解說明
router.get('/nearby', async (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({
      success: false,
      message: '請提供定位資訊'
    });
  }

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

        ROUND(
          6371 * 2 * ASIN(
            SQRT(
              POWER(SIN(RADIANS(p.latitude - $1) / 2), 2) +
              COS(RADIANS($1)) * COS(RADIANS(p.latitude)) *
              POWER(SIN(RADIANS(p.longitude - $2) / 2), 2)
            )
          )
        , 2) AS distance_km

      FROM surplus_food sf
      JOIN providers p ON sf.provider_id = p.id
      WHERE sf.quantity > 0
      ORDER BY distance_km ASC
    `;

    const result = await db.query(sql, [lat, lng]);

    const nearby = result.rows.filter(r => r.distance_km <= 5);

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


// ================== FOOD DETAIL ==================
router.get('/:foodId', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT f.*, p.store_name, p.address AS store_address
       FROM surplus_food f
       LEFT JOIN providers p ON f.provider_id = p.id
       WHERE f.food_id = $1`,
      [req.params.foodId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '找不到商品'
      });
    }

    return res.json({
      success: true,
      data: result.rows[0]
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