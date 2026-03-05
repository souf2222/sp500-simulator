import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { exec } from 'child_process';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 5173;

app.use(cors());
app.use(express.json());

const SP500_TICKERS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK-B', 'UNH', 'JNJ',
  'V', 'XOM', 'JPM', 'WMT', 'MA', 'PG', 'CVX', 'HD', 'LLY', 'ABBV',
  'MRK', 'PFE', 'AVGO', 'KO', 'PEP', 'COST', 'TMO', 'MCD', 'CSCO', 'ACN',
  'ABT', 'DHR', 'WFC', 'NKE', 'ADBE', 'CRM', 'TXN', 'NEE', 'PM', 'BMY',
  'DIS', 'UNP', 'VZ', 'RTX', 'HON', 'INTC', 'ORCL', 'AMD', 'IBM', 'QCOM'
];

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (err) {
      console.log(`Attempt ${i + 1} failed: ${err.message}`);
      if (i < retries - 1) await new Promise(r => setTimeout(r, 2000));
    }
  }
  return null;
}

async function downloadStockData(ticker) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 5);
  
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?period1=${Math.floor(startDate.getTime() / 1000)}&period2=${Math.floor(endDate.getTime() / 1000)}&interval=1d`;
  
  console.log(`Fetching ${ticker}...`);
  const data = await fetchWithRetry(url);
  
  if (data?.chart?.result?.[0]) {
    const result = data.chart.result[0];
    const timestamps = result.timestamp;
    const quote = result.indicators.quote[0];
    
    return timestamps.map((ts, i) => ({
      date: new Date(ts * 1000).toISOString().split('T')[0],
      close: quote.close[i],
      volume: quote.volume[i]
    })).filter(d => d.close !== null);
  }
  return null;
}

app.post('/api/refresh-data', async (req, res) => {
  try {
    console.log('Refreshing data...');
    
    const stocks = {};
    const failed = [];
    
    for (const ticker of SP500_TICKERS) {
      const data = await downloadStockData(ticker);
      if (data && data.length > 0) {
        stocks[ticker] = data;
        console.log(`✓ ${ticker}: ${data.length} days`);
      } else {
        failed.push(ticker);
        console.log(`✗ ${ticker}: FAILED`);
      }
      await new Promise(r => setTimeout(r, 200));
    }
    
    console.log('Downloading S&P 500 index...');
    const sp500 = await downloadStockData('^GSPC');
    
    const output = {
      downloadedAt: new Date().toISOString(),
      stocks,
      sp500: sp500 || [],
      failedTickers: failed
    };
    
    const dataDir = join(__dirname, 'public', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(
      join(dataDir, 'stocks.json'),
      JSON.stringify(output, null, 2)
    );
    
    console.log('✓ Data refreshed successfully');
    res.json({ success: true });
  } catch (err) {
    console.error('Error refreshing data:', err);
    res.status(500).json({ error: err.message });
  }
});

app.use(express.static(join(__dirname, 'dist')));
app.use(express.static(join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
