import React, { useState } from 'react';
import MapView from './components/MapView';
import { sendNlpRequest } from './services/api';

function App() {
  const [inputValue, setInputValue] = useState('');
  const [queryResult, setQueryResult] = useState(null);

  const handleQuery = async () => {
    if (!inputValue) return;
    try {
      // 调用后端NLP接口
      const res = await sendNlpRequest(inputValue);
      setQueryResult(res.data);
    } catch (err) {
      console.error('NLP请求错误', err);
    }
  };

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px', backgroundColor: '#f0f0f0' }}>
        <input
          type="text"
          style={{ width: '400px', marginRight: '10px' }}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="例如: 显示曼哈顿中央公园2公里内的咖啡馆"
        />
        <button onClick={handleQuery}>查询</button>
      </div>

      {/* 将查询结果传给地图组件做渲染 */}
      <MapView queryResult={queryResult} />
    </div>
  );
}

export default App;
