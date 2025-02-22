import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api'; // 后端地址

// 调用 NLP 路由，传入用户输入
export async function sendNlpRequest(userInput) {
  const response = await axios.post(`${API_BASE_URL}/nlp`, { userInput });
  return response.data;
}

// 调用等时圈路由
export async function fetchIsochrone(center, time, selectedPOIs) {
  const response = await axios.post(`${API_BASE_URL}/isochrone`, {
    center,
    time,
    selectedPOIs,
  });
  return response.data;
}
