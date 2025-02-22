// backend/services/text2sqlService.js
const fetch = require('node-fetch');

/**
 * generateSQL 会将用户自然语言通过 RAGFlow/Dify（Deepseek r1）模型服务
 * 转换为SQL语句示例。这里只提供一个伪流程示例，需根据实际API进行调整。
 */
async function generateSQL(userInput) {
  // 1. 向本地模型服务发送请求
  // 以下示例假设 RAGFlow/Dify 提供一个文本端点，可返回SQL
  // 具体API需根据实际情况修正
  const response = await fetch('http://localhost:80/generate-sql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt: userInput }),
  });

  const data = await response.json();
  // 假设 data.sql 是远程模型返回的SQL字符串
  let generatedSQL = data.sql;

  // 2. 可根据业务逻辑做一些安全过滤，例如只允许 SELECT 语句
  if (!generatedSQL.trim().toLowerCase().startsWith('select')) {
    throw new Error('不合法的SQL语句');
  }

  // 在这里也可以对SQL字段和表名做白名单过滤

  // 3. 返回SQL
  return generatedSQL;
}

module.exports = {
  generateSQL
};
