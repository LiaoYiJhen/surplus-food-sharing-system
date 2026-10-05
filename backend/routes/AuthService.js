const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { geocode } = require('./LocationService');

// =================================================================
// [Use Case 2] Register Member: 處理尚未有帳號的提供者與領取者建立新帳號
// =================================================================
router.post('/register', async (req, res) => {
  // [Use Case 2 主流程 4 & 5 後續] 後端接收前端傳遞的註冊資料
  const { account, password, role, store_name, address, name } = req.body;

  // [Use Case 2 替代流程 6a] 格式錯誤 (缺少欄位)：系統回傳錯誤訊息
  if (!account || !password || !role) {
    return res.status(400).json({ success: false, message: '缺少欄位' });
  }

  try {
    // [Use Case 2 主流程 6] 系統驗證帳號未存在
    const exists = await db.query(
      'SELECT id FROM members WHERE account = $1',
      [account]
    );

    // [Use Case 2 替代流程 6a] 帳號已存在：系統回傳錯誤訊息
    if (exists.rows.length > 0) {
      return res.status(400).json({ success: false, message: '帳號已存在' });
    }

    const hashed = await bcrypt.hash(password, 10);

    // [Use Case 2 主流程 7] 系統將註冊資料存入資料庫
    const result = await db.query(
      'INSERT INTO members (account, password, role) VALUES ($1,$2,$3) RETURNING id',
      [account, hashed, role]
    );

    const memberId = result.rows[0].id;

    // [Use Case 2 主流程 7 延續] 依據角色將對應的詳細資料存入各自資料表
    if (role === 'provider') {
      const geo = await geocode(address);

      await db.query(
        `INSERT INTO providers (member_id, store_name, address, latitude, longitude)
         VALUES ($1,$2,$3,$4,$5)`,
        [memberId, store_name, address, geo?.lat || null, geo?.lng || null]
      );
    } else {
      await db.query(
        `INSERT INTO recipients (member_id, name)
         VALUES ($1,$2)`,
        [memberId, name]
      );
    }

    // [Use Case 2 主流程 8] 系統完成註冊 (回傳成功狀態供前端執行導向)
    res.json({ success: true, message: '註冊成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// =================================================================
// [Use Case 1] Login System: 處理提供者與領取者的登入驗證
// =================================================================
router.post('/login', async (req, res) => {
  // [Use Case 1 主流程 1 & 2 後續] 後端接收前端傳遞的帳號與密碼
  const { account, password } = req.body;

  try {
    // [Use Case 1 主流程 3] 系統驗證帳號存在
    const result = await db.query(
      'SELECT * FROM members WHERE account = $1',
      [account]
    );

    // [Use Case 1 替代流程 3a] 帳號不存在：系統回傳錯誤狀態
    if (!result.rows.length) {
      return res.status(401).json({ success: false });
    }

    const member = result.rows[0];

    console.log("input password:", password);
    console.log("db hash:", member.password);

    // [Use Case 1 主流程 3 延續] 系統驗證密碼正確
    const match = await bcrypt.compare(password, member.password);

    // [Use Case 1 替代流程 3a] 密碼錯誤：系統回傳錯誤狀態
    if (!match) {
      return res.status(401).json({ success: false });
    }

    // [Use Case 1 後置條件] 系統記錄登入狀態 (核發 JWT Token)
    const token = jwt.sign(
      { id: member.id, role: member.role },
      process.env.JWT_SECRET || 'default_secret_key_for_dev',
      { expiresIn: '7d' }
    );

    let name = '';

    // [Use Case 1 主流程 4 準備] 依據角色取得對應的名稱資訊，供前端專屬頁面顯示
    if (member.role === 'provider') {
      const r = await db.query(
        'SELECT store_name FROM providers WHERE member_id=$1',
        [member.id]
      );
      name = r.rows[0]?.store_name;
    } else {
      const r = await db.query(
        'SELECT name FROM recipients WHERE member_id=$1',
        [member.id]
      );
      name = r.rows[0]?.name;
    }

    // [Use Case 1 主流程 4] 系統完成登入並導向對應頁面 (回傳 Token 與身分資料供前端處理導向)
    res.json({
      success: true,
      token,
      role: member.role,
      name
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;