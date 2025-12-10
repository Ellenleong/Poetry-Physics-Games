// api/proxy.js
export default async function handler(req, res) {
  // 設定 CORS 標頭，允許你的網頁跨域調用
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 處理 OPTIONS 預檢請求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // 從請求的 URL 中獲取原本要訪問 Google 的路徑
    // 例如：/api/proxy?path=v1/models
    const { path } = req.query;
    
    if (!path) {
      return res.status(400).json({ error: 'Missing path parameter' });
    }

    // 重新組裝 Google API 的完整網址
    // 注意：我們會把前端傳來的 key 等參數保留在 query 中
    const googleUrl = `https://generativelanguage.googleapis.com/${path}`;
    
    // 準備 fetch 的選項
    const fetchOptions = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // 如果是 POST 請求，需要把 body 帶上
    if (req.method === 'POST' && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    // 在美國伺服器發起請求
    const googleRes = await fetch(googleUrl + "?" + new URLSearchParams(req.query).toString(), fetchOptions);
    const data = await googleRes.json();

    // 將 Google 的回應回傳給你的網頁
    res.status(googleRes.status).json(data);

  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}