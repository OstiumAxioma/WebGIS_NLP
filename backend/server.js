// backend/server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const isochroneRouter = require('./routes/isochrone');
const nlpRouter = require('./routes/nlp');

const app = express();
const PORT = 3001;

app.use(bodyParser.json());
app.use(cors());

// 保留等时圈路由
app.use('/api/isochrone', isochroneRouter);

// 新增NLP路由
app.use('/api/nlp', nlpRouter);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ error: '服务器内部错误' });
});

app.listen(PORT, () => {
  console.log(`服务器正在 http://localhost:${PORT} 运行`);
});
