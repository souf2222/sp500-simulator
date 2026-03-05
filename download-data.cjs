const fs = require('fs');
const path = require('path');

const SP500_TICKERS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK-B', 'UNH', 'JNJ',
  'V', 'XOM', 'JPM', 'WMT', 'MA', 'PG', 'CVX', 'HD', 'LLY', 'ABBV',
  'MRK', 'PFE', 'AVGO', 'KO', 'PEP', 'COST', 'TMO', 'MCD', 'CSCO', 'ACN',
  'ABT', 'DHR', 'WFC', 'NKE', 'ADBE', 'CRM', 'TXN', 'NEE', 'PM', 'BMY',
  'DIS', 'UNP', 'VZ', 'RTX', 'HON', 'INTC', 'ORCL', 'AMD', 'IBM', 'QCOM'
];

// Parse years from command line or default to 25
const args = process.argv.slice(2);
const years = args[0] ? Math.min(parseInt(args[0]), 25) : 25;

console.log(`Downloading ${years} years of data...\n`);

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
  startDate.setFullYear(startDate.getFullYear() - years);
  
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?period1=${Math.floor(startDate.getTime() / 1000)}&period2=${Math.floor(endDate.getTime() / 1000)}&interval=1d`;
  
  console.log(`Fetching ${ticker}...`);
  const data = await fetchWithRetry(url);
  
  if (data?.chart?.result?.[0]) {
    const result = data.chart.result[0];
    const timestamps = result.timestamp;
    const quote = result.indicators.quote[0];
    
    // Get market cap from meta (daily data if available)
    const metaMarketCap = result.meta?.marketCap;
    
    return timestamps.map((ts, i) => ({
      date: new Date(ts * 1000).toISOString().split('T')[0],
      close: quote.close[i],
      volume: quote.volume[i],
      // Use meta market cap as baseline, could be refined with share count data
      marketCap: metaMarketCap || null
    })).filter(d => d.close !== null);
  }
  return null;
}

async function downloadAll() {
  console.log('Downloading S&P 500 data...\n');
  
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
  
  console.log('\nDownloading S&P 500 index...');
  const sp500 = await downloadStockData('^GSPC');
  
  const output = {
    downloadedAt: new Date().toISOString(),
    stocks,
    sp500: sp500 || [],
    failedTickers: failed
  };
  
  const dataDir = path.join(__dirname, 'public', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(dataDir, 'stocks.json'),
    JSON.stringify(output, null, 2)
  );
  
  console.log(`\n✓ Data saved to public/data/stocks.json`);
  console.log(`  Years: ${years}`);
  console.log(`  Successful: ${Object.keys(stocks).length} stocks`);
  console.log(`  Failed: ${failed.length} stocks`);
  console.log(`  SP500: ${sp500?.length || 0} days`);
}

downloadAll().catch(console.error);
