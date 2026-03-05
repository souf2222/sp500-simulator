import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 5173;

app.use(cors());
app.use(express.json());

const SP500_TICKERS = [
  'A', 'AAL', 'AAPL', 'ABBV', 'ABC', 'ABMD', 'ABT', 'ACN', 'ADBE', 'ADI',
  'ADM', 'ADP', 'ADSK', 'AEE', 'AEP', 'AES', 'AFL', 'AIG', 'AIV', 'AIZ',
  'AJG', 'AKAM', 'ALB', 'ALGN', 'ALK', 'ALL', 'ALXN', 'AMAT', 'AMCR', 'AMD',
  'AMGN', 'AMP', 'AMT', 'AMZN', 'ANET', 'ANSS', 'ANTM', 'AON', 'AOS', 'APA',
  'APD', 'APH', 'APTV', 'ARE', 'ATO', 'AVB', 'AVGO', 'AVY', 'AWK', 'AXP',
  'AZO', 'BA', 'BAB', 'BAC', 'BAX', 'BBY', 'BDX', 'BEN', 'BIIB', 'BK',
  'BKNG', 'BKR', 'BLK', 'BMY', 'BRK-B', 'BSX', 'BTU', 'BWA', 'BXP', 'C',
  'CAG', 'CAH', 'CAT', 'CB', 'CBOE', 'CBRE', 'CCI', 'CDNS', 'CDW', 'CE',
  'CHRW', 'CI', 'CINF', 'CL', 'CLX', 'CMA', 'CMCSA', 'CME', 'CMG', 'CMI',
  'CMS', 'CNC', 'CNP', 'COF', 'COO', 'COP', 'COST', 'CPRT', 'CRL', 'CRM',
  'CSCO', 'CSX', 'CTAS', 'CTLT', 'CTVA', 'CVS', 'CVX', 'D', 'DAL', 'DD',
  'DE', 'DFS', 'DG', 'DHI', 'DHR', 'DIS', 'DISCK', 'DISH', 'DLR', 'DLTR',
  'DOV', 'DOW', 'DPZ', 'DRI', 'DTE', 'DUK', 'DVA', 'DVN', 'DXC', 'DXCM',
  'EBAY', 'ECL', 'ED', 'EFX', 'EIX', 'EL', 'ELV', 'EMR', 'ENPH', 'EOG',
  'EPAM', 'EQIX', 'EQR', 'ES', 'ESS', 'ETN', 'ETR', 'EVAL', 'EW', 'EXC',
  'EXPD', 'EXPE', 'EXR', 'F', 'FANG', 'FAST', 'FB', 'FCX', 'FDS', 'FDX',
  'FE', 'FFIV', 'FIS', 'FISV', 'FITB', 'FLT', 'FMC', 'FOX', 'FOXA', 'FRC',
  'FRSH', 'FTNT', 'FTV', 'GD', 'GE', 'GILD', 'GIS', 'GL', 'GLW', 'GM',
  'GNRC', 'GOOG', 'GOOGL', 'GPC', 'GPN', 'GS', 'GWW', 'HAL', 'HAS', 'HBAN',
  'HCA', 'HD', 'HES', 'HIG', 'HII', 'HLT', 'HOLX', 'HON', 'HP', 'HPE',
  'HPQ', 'HRB', 'HRL', 'HSIC', 'HSY', 'HUM', 'HWM', 'IBM', 'ICE', 'IDXX',
  'IEX', 'IFF', 'ILMN', 'INCY', 'INFO', 'INTC', 'INTU', 'INVH', 'IONQ', 'IP',
  'IPG', 'IQV', 'IR', 'IRM', 'ISRG', 'IT', 'ITW', 'IVZ', 'J', 'JBHT',
  'JCI', 'JKHY', 'JNJ', 'JPM', 'K', 'KDP', 'KEY', 'KEYS', 'KHC', 'KIM',
  'KLAC', 'KMB', 'KMI', 'KMX', 'KO', 'KR', 'L', 'LDOS', 'LEN', 'LH',
  'LHX', 'LIN', 'LKQ', 'LLY', 'LMT', 'LNC', 'LNT', 'LOW', 'LRCX', 'LULU',
  'LUV', 'LW', 'LYB', 'LYV', 'MA', 'MAA', 'MAR', 'MAS', 'MCD', 'MCHP',
  'MCK', 'MCO', 'MDLZ', 'MDT', 'META', 'MET', 'MGM', 'MHK', 'MKC', 'MMC',
  'MMM', 'MO', 'MOH', 'MOS', 'MPC', 'MRK', 'MRNA', 'MRO', 'MS', 'MSCI',
  'MSFT', 'MSI', 'MTB', 'MTCH', 'MTD', 'MU', 'NCLH', 'NDAQ', 'NDSN', 'NEE',
  'NEM', 'NFLX', 'NI', 'NKE', 'NOC', 'NOW', 'NRG', 'NSC', 'NTAP', 'NTRS',
  'NUE', 'NVDA', 'NVR', 'NWS', 'NWSA', 'O', 'ODFL', 'OKE', 'OMC', 'ON',
  'ORCL', 'ORLY', 'OXY', 'P', 'PANW', 'PAYC', 'PAYX', 'PCAR', 'PCG', 'PEAK',
  'PEG', 'PENN', 'PFE', 'PG', 'PGR', 'PH', 'PHM', 'PKG', 'PKI', 'PLD',
  'PM', 'PNC', 'PNW', 'POOL', 'PPG', 'PPL', 'PRU', 'PSA', 'PSX', 'PTC',
  'PWR', 'PYPL', 'QCOM', 'RCL', 'REG', 'REGN', 'RF', 'RHI', 'RL', 'RMD',
  'ROK', 'ROL', 'ROP', 'ROST', 'RSG', 'RTX', 'SHW', 'SIRI', 'SIVB',
  'SLB', 'SLE', 'SLG', 'SNA', 'SNAP', 'SNPS', 'SO', 'SPG', 'SPGI', 'SRE',
  'STE', 'STZ', 'SWK', 'SWKS', 'SYF', 'SYK', 'SYY', 'T', 'TAP', 'TDG',
  'TDY', 'TEL', 'TER', 'TFC', 'TGT', 'TJX', 'TMO', 'TMUS', 'TPR', 'TRGP',
  'TROW', 'TRV', 'TSCO', 'TSLA', 'TSN', 'TT', 'TTWO', 'TXN', 'TXT', 'TYL',
  'UA', 'UAA', 'UAL', 'UHS', 'ULTA', 'UNH', 'UNP', 'UPS', 'URBN', 'USB',
  'V', 'VALE', 'VFC', 'VICI', 'VLO', 'VMC', 'VRSK', 'VRSN', 'VRTX', 'VTR',
  'VTRS', 'VZ', 'W', 'WAB', 'WAT', 'WBA', 'WBD', 'WCG', 'WDC', 'WEC',
  'WELL', 'WFC', 'WHR', 'WLTW', 'WM', 'WMB', 'WMT', 'WRB', 'WRK', 'WST',
  'WTW', 'WY', 'WYNN', 'XEL', 'XOM', 'XRAY', 'XYL', 'YUM', 'YUMC', 'ZBH',
  'ZION', 'ZTS'
];

let db = null;

function initDatabase() {
  const dbPath = join(__dirname, 'data.db');
  db = new Database(dbPath);
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS stocks (
      id INTEGER PRIMARY KEY,
      ticker TEXT NOT NULL,
      date TEXT NOT NULL,
      close REAL,
      volume INTEGER
    );
    CREATE INDEX IF NOT EXISTS idx_stocks_ticker ON stocks(ticker);
    CREATE INDEX IF NOT EXISTS idx_stocks_date ON stocks(date);
    
    CREATE TABLE IF NOT EXISTS sp500 (
      id INTEGER PRIMARY KEY,
      date TEXT NOT NULL UNIQUE,
      close REAL
    );
    CREATE INDEX IF NOT EXISTS idx_sp500_date ON sp500(date);
    
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);
  
  console.log('Database initialized');
}

function loadDataToDatabase(data) {
  const insertStock = db.prepare('INSERT OR REPLACE INTO stocks (ticker, date, close, volume) VALUES (?, ?, ?, ?)');
  const insertSP500 = db.prepare('INSERT OR REPLACE INTO sp500 (date, close) VALUES (?, ?)');
  
  const insertMany = db.transaction((stocks) => {
    for (const [ticker, points] of Object.entries(stocks)) {
      for (const p of points) {
        insertStock.run(ticker, p.date, p.close, p.volume);
      }
    }
  });
  
  const insertSP500Many = db.transaction((points) => {
    for (const p of points) {
      insertSP500.run(p.date, p.close);
    }
  });
  
  console.log('Loading stocks...');
  insertMany(data.stocks);
  
  console.log('Loading S&P 500...');
  insertSP500Many(data.sp500);
  
  db.prepare('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)').run('downloadedAt', data.downloadedAt);
  
  console.log('Data loaded to database');
}

function getStockData(years) {
  const cutoffDate = new Date();
  cutoffDate.setFullYear(cutoffDate.getFullYear() - years);
  const cutoffStr = cutoffDate.toISOString().split('T')[0];
  
  const stocks = db.prepare(`
    SELECT ticker, date, close, volume 
    FROM stocks 
    WHERE date >= ?
    ORDER BY ticker, date
  `).all(cutoffStr);
  
  const sp500 = db.prepare(`
    SELECT date, close 
    FROM sp500 
    WHERE date >= ?
    ORDER BY date
  `).all(cutoffStr);
  
  const stocksByTicker = {};
  for (const s of stocks) {
    if (!stocksByTicker[s.ticker]) stocksByTicker[s.ticker] = [];
    stocksByTicker[s.ticker].push({ date: s.date, close: s.close, volume: s.volume });
  }
  
  return {
    stocks: stocksByTicker,
    sp500: sp500.map(s => ({ date: s.date, close: s.close })),
    downloadedAt: db.prepare('SELECT value FROM meta WHERE key = ?').get('downloadedAt')?.value
  };
}

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

async function downloadStockData(ticker, years = 30) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - years);
  
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?period1=${Math.floor(startDate.getTime() / 1000)}&period2=${Math.floor(endDate.getTime() / 1000)}&interval=1d`;
  
  console.log(`Fetching ${ticker}...`);
  const data = await fetchWithRetry(url);
  
  if (data?.chart?.result?.[0]) {
    const result = data.chart.result[0];
    const timestamps = result.timestamp;
    const quote = result.indicators?.quote?.[0];
    
    if (!timestamps || !quote) return null;
    
    return timestamps.map((ts, i) => ({
      date: new Date(ts * 1000).toISOString().split('T')[0],
      close: quote.close[i],
      volume: quote.volume[i]
    })).filter(d => d.close !== null);
  }
  return null;
}

app.get('/api/stock-data', (req, res) => {
  const years = parseInt(req.query.years) || 5;
  
  try {
    const data = getStockData(years);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/refresh-data', async (req, res) => {
  try {
    console.log('Downloading fresh data (30 years)...');
    
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
    
    loadDataToDatabase(output);
    
    console.log('✓ Data refreshed successfully');
    res.json({ success: true });
  } catch (err) {
    console.error('Error refreshing data:', err);
    res.status(500).json({ error: err.message });
  }
});

app.use(express.static(join(__dirname, 'dist')));
app.use(express.static(join(__dirname, 'public')));

async function startup() {
  initDatabase();
  
  const dataFile = join(__dirname, 'public', 'data', 'stocks.json');
  const dbPath = join(__dirname, 'data.db');
  
  const needsImport = db.prepare('SELECT COUNT(*) as count FROM stocks').get().count === 0;
  
  if (needsImport && fs.existsSync(dataFile)) {
    console.log('Importing existing JSON data to database...');
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
    loadDataToDatabase(data);
  }
  
  if (needsImport) {
    console.log('No data found. Use /api/refresh-data to download data.');
  }
}

startup().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
});
