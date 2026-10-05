const { Pool } = require('pg');
require('dotenv').config();

const useSSL =
  process.env.DATABASE_URL &&
  process.env.DATABASE_URL.includes('render.com');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSSL ? { rejectUnauthorized: false } : false
});

pool.on('connect', () => {
  console.log('📦 PostgreSQL 已建立新連線');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL 錯誤:', err);
});

pool.query('SELECT NOW()')
  .then(() => {
    console.log('[🎉 成功] 已成功觸發第一次查詢，資料庫連線完全正常！');
  })
  .catch((err) => {
    console.error('❌ [🚨 失敗] 啟動測試連線失敗，請檢查 DATABASE_URL 或網路：', err.message);
  });

module.exports = pool;