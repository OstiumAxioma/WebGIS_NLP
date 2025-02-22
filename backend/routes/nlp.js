// backend/routes/nlp.js
const express = require('express');
const pgp = require('pg-promise')();
const router = express.Router();
const text2sqlService = require('../services/text2sqlService');

// 修改为你的数据库IP和密码
const db = pgp({
  host: '192.168.31.138',
  port: 5432,
  database: 'nyc',
  user: 'postgres',
  password: '579098',
});

router.post('/', async (req, res) => {
  try {
    // 1. 获取用户的自然语言输入
    const { userInput } = req.body;

    // 2. 如果用户输入包含「等时圈」等关键词，可以直接交给 isochrone 路由处理
    //    或者由前端决定在 /api/isochrone 或 /api/nlp 调用。
    //    这里示例：我们只做普通Text2SQL查询。
    //    如果要统一处理，也可以在这里做分支判断。
    //    演示仅保留普通文本->SQL的逻辑

    // 3. 调用 text2sqlService，将自然语言转换为SQL语句
    const sqlQuery = await text2sqlService.generateSQL(userInput);

    // 4. 在数据库中执行该SQL查询
    const result = await db.any(sqlQuery);

    // 5. 假设查询返回几何字段geom，需要转成 GeoJSON（若你在SQL中已经ST_AsGeoJSON处理，也可以直接解析）
    //    此处示例：如果 result 包含 { geom: '...' }，就将其JSON.parse
    const parsedResult = result.map(row => {
      if (row.geom) {
        return {
          ...row,
          geom: JSON.parse(row.geom),
        };
      }
      return row;
    });

    // 6. 返回给前端
    res.json({
      sql: sqlQuery,
      data: parsedResult,
    });
  } catch (error) {
    console.error('NLP路由错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

module.exports = router;
