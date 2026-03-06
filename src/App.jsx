import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
  'EPAM', 'EQIX', 'EQR', 'ES', 'ESS', 'ETN', 'ETR', 'EW', 'EXC', 'EXPD',
  'EXPE', 'EXR', 'F', 'FANG', 'FAST', 'FB', 'FCX', 'FDS', 'FDX', 'FE',
  'FFIV', 'FIS', 'FISV', 'FITB', 'FLT', 'FMC', 'FOX', 'FOXA', 'FRC', 'FRSH',
  'FTNT', 'FTV', 'GD', 'GE', 'GILD', 'GIS', 'GL', 'GLW', 'GM', 'GNRC',
  'GOOG', 'GOOGL', 'GPC', 'GPN', 'GS', 'GWW', 'HAL', 'HAS', 'HBAN', 'HCA',
  'HD', 'HES', 'HIG', 'HII', 'HLT', 'HOLX', 'HON', 'HP', 'HPE', 'HPQ',
  'HRB', 'HRL', 'HSIC', 'HSY', 'HUM', 'HWM', 'IBM', 'ICE', 'IDXX', 'IEX',
  'IFF', 'ILMN', 'INCY', 'INFO', 'INTC', 'INTU', 'INVH', 'IONQ', 'IP', 'IPG',
  'IQV', 'IR', 'IRM', 'ISRG', 'IT', 'ITW', 'IVZ', 'J', 'JBHT', 'JCI',
  'JKHY', 'JNJ', 'JPM', 'K', 'KDP', 'KEY', 'KEYS', 'KHC', 'KIM', 'KLAC',
  'KMB', 'KMI', 'KMX', 'KO', 'KR', 'L', 'LDOS', 'LEN', 'LH', 'LHX', 'LIN',
  'LKQ', 'LLY', 'LMT', 'LNC', 'LNT', 'LOW', 'LRCX', 'LULU', 'LUV', 'LW',
  'LYB', 'LYV', 'MA', 'MAA', 'MAR', 'MAS', 'MCD', 'MCHP', 'MCK', 'MCO',
  'MDLZ', 'MDT', 'META', 'MET', 'MGM', 'MHK', 'MKC', 'MMC', 'MMM', 'MO',
  'MOH', 'MOS', 'MPC', 'MRK', 'MRNA', 'MRO', 'MS', 'MSCI', 'MSFT', 'MSI',
  'MTB', 'MTCH', 'MTD', 'MU', 'NCLH', 'NDAQ', 'NDSN', 'NEE', 'NEM', 'NFLX',
  'NI', 'NKE', 'NOC', 'NOW', 'NRG', 'NSC', 'NTAP', 'NTRS', 'NUE', 'NVDA',
  'NVR', 'NWS', 'NWSA', 'O', 'ODFL', 'OKE', 'OMC', 'ON', 'ORCL', 'ORLY',
  'OXY', 'P', 'PANW', 'PAYC', 'PAYX', 'PCAR', 'PCG', 'PEAK', 'PEG', 'PENN',
  'PFE', 'PG', 'PGR', 'PH', 'PHM', 'PKG', 'PKI', 'PLD', 'PM', 'PNC', 'PNW',
  'POOL', 'PPG', 'PPL', 'PRU', 'PSA', 'PSX', 'PTC', 'PWR', 'PYPL', 'QCOM',
  'RCL', 'REG', 'REGN', 'RF', 'RHI', 'RL', 'RMD', 'ROK', 'ROL', 'ROP',
  'ROST', 'RSG', 'RTX', 'SHW', 'SIRI', 'SIVB', 'SLB', 'SLE', 'SLG',
  'SNA', 'SNAP', 'SNPS', 'SO', 'SPG', 'SPGI', 'SRE', 'STE', 'STZ', 'SWK',
  'SWKS', 'SYF', 'SYK', 'SYY', 'T', 'TAP', 'TDG', 'TDY', 'TEL', 'TER',
  'TFC', 'TGT', 'TJX', 'TMO', 'TMUS', 'TPR', 'TRGP', 'TROW', 'TRV', 'TSCO',
  'TSLA', 'TSN', 'TT', 'TTWO', 'TXN', 'TXT', 'TYL', 'UA', 'UAA', 'UAL',
  'UHS', 'ULTA', 'UNH', 'UNP', 'UPS', 'URBN', 'USB', 'V', 'VALE', 'VFC',
  'VICI', 'VLO', 'VMC', 'VRSK', 'VRSN', 'VRTX', 'VTR', 'VTRS', 'VZ', 'W',
  'WAB', 'WAT', 'WBA', 'WBD', 'WCG', 'WDC', 'WEC', 'WELL', 'WFC', 'WHR',
  'WLTW', 'WM', 'WMB', 'WMT', 'WRB', 'WRK', 'WST', 'WTW', 'WY', 'WYNN',
  'XEL', 'XOM', 'XRAY', 'XYL', 'YUM', 'YUMC', 'ZBH', 'ZION', 'ZTS'
];

const generateStockData = (ticker, seed, years = 25) => {
  const data = [];
  let price = 100 + (seed * 50) % 200;
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - years);
  
  let currentDate = new Date(startDate);
  const volatility = 0.015 + (seed % 10) * 0.002;
  const trend = (seed % 10 - 5) * 0.0005;
  
  while (currentDate <= new Date()) {
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const change = (Math.random() - 0.5) * 2 * volatility + trend;
      price = price * (1 + change);
      price = Math.max(price, 10);
      
      data.push({
        date: currentDate.toISOString().split('T')[0],
        close: price,
        volume: Math.floor(1000000 + Math.random() * 50000000)
      });
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return data;
};

const generateSP500 = (years = 25) => {
  const data = [];
  let indexValue = 4500;
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - years);
  
  let currentDate = new Date(startDate);
  const volatility = 0.012;
  const trend = 0.0003;
  
  while (currentDate <= new Date()) {
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const change = (Math.random() - 0.5) * 2 * volatility + trend;
      indexValue = indexValue * (1 + change);
      indexValue = Math.max(indexValue, 1000);
      
      data.push({
        date: currentDate.toISOString().split('T')[0],
        close: indexValue
      });
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return data;
};

const simulateStrategy = (allStocks, sp500Data, buyRank, sellRank, useRankChange = false, rankChangeFrom = 4, rankChangeTo = 3, minHoldDays = 5, useMomentum = true, momentumDays = 20, stopLossPct = 0.15, takeProfitPct = 0.25) => {
  if (!allStocks || allStocks.length === 0) return null;

  console.log('Simulating with', allStocks.length, 'stocks');
  
  const results = [];
  const trades = [];
  const initialCapital = 10000;
  let cash = initialCapital;
  let shares = 0;
  let inPosition = false;
  let positionTicker = '';
  let buyPrice = 0;
  let buyDate = '';
  let buyDayIndex = 0;
  let highestPrice = 0;
  let cooldownDays = 0;

  const allDates = [...new Set(allStocks.flatMap(s => s.data.map(d => d.date)))].sort();
  
  console.log('Total dates:', allDates.length, 'First:', allDates[0], 'Last:', allDates[allDates.length-1]);
  
  const warmUpDays = 30;
  const validDates = allDates.slice(Math.max(warmUpDays, Math.floor(allDates.length * 0.05)), allDates.length);
  
  console.log('Valid trading dates:', validDates.length);

  const getStockDataAtDate = (ticker, date) => {
    const stock = allStocks.find(s => s.ticker === ticker);
    if (!stock) return null;
    return stock.data.find(d => d.date === date);
  };

  const calculateMomentum = (ticker, currentDate, days) => {
    const stock = allStocks.find(s => s.ticker === ticker);
    if (!stock) return 0;
    
    const currentIdx = stock.data.findIndex(d => d.date === currentDate);
    if (currentIdx < days) return 0;
    
    const pastData = stock.data[currentIdx - days];
    const currentData = stock.data[currentIdx];
    
    if (!pastData || !currentData) return 0;
    return (currentData.close - pastData.close) / pastData.close;
  };

  const getVolumeAdjustedPrice = (ticker, date) => {
    const data = getStockDataAtDate(ticker, date);
    if (!data) return 0;
    return data.close * Math.log10(data.volume + 1);
  };

  for (let i = 0; i < validDates.length; i++) {
    const currentDate = validDates[i];
    
    if (cooldownDays > 0) {
      cooldownDays--;
    }
    
    const currentDayData = allStocks.map(s => {
      const dayData = s.data.find(d => d.date === currentDate);
      if (!dayData) return null;
      const volumeAdjusted = getVolumeAdjustedPrice(s.ticker, currentDate);
      return { 
        ticker: s.ticker, 
        close: dayData.close, 
        volume: dayData.volume,
        marketCap: volumeAdjusted,
        date: dayData.date 
      };
    }).filter(d => d !== null);

    const prevDate = i > 0 ? validDates[i - 1] : null;
    const prevDayData = prevDate ? allStocks.map(s => {
      const dayData = s.data.find(d => d.date === prevDate);
      if (!dayData) return null;
      const volumeAdjusted = getVolumeAdjustedPrice(s.ticker, prevDate);
      return { 
        ticker: s.ticker, 
        close: dayData.close, 
        volume: dayData.volume,
        marketCap: volumeAdjusted,
        date: dayData.date 
      };
    }).filter(d => d !== null) : [];

    if (currentDayData.length < 10) continue;

    const currentSorted = [...currentDayData].sort((a, b) => (b.marketCap || b.close) - (a.marketCap || a.close));
    const currentRanks = {};
    currentSorted.forEach((s, idx) => { currentRanks[s.ticker] = idx + 1; });

    const prevSorted = prevDayData.length > 0 ? [...prevDayData].sort((a, b) => (b.marketCap || b.close) - (a.marketCap || a.close)) : [];
    const prevRanks = {};
    prevSorted.forEach((s, idx) => { prevRanks[s.ticker] = idx + 1; });

    if (i === 0) {
      console.log('First day ranks:', currentRanks);
      console.log('buyRank:', buyRank);
    }

    let shouldBuy = false;
    let buyTicker = '';

    if (!inPosition && cooldownDays === 0) {
      if (useRankChange && prevDate) {
        for (const ticker of Object.keys(prevRanks)) {
          if (prevRanks[ticker] === rankChangeFrom && currentRanks[ticker] === rankChangeTo) {
            if (!useMomentum || calculateMomentum(ticker, currentDate, momentumDays) > -0.1) {
              shouldBuy = true;
              buyTicker = ticker;
              if (i % 50 === 0) console.log('BUY via rankChange:', ticker);
              break;
            }
          }
        }
      } else {
        // Simple strategy: buy any top-N stock
        for (const ticker of Object.keys(currentRanks)) {
          if (currentRanks[ticker] <= buyRank) {
            const momentum = useMomentum ? calculateMomentum(ticker, currentDate, momentumDays) : 0;
            if (momentum > -0.1) {
              shouldBuy = true;
              buyTicker = ticker;
              if (i % 50 === 0) console.log('BUY:', ticker, 'rank:', currentRanks[ticker], 'momentum:', momentum);
              break;
            }
          }
        }
      }
    }

    // Force first buy for testing
    if (i === 0 && !inPosition && currentDayData.length > 0) {
      const topStock = currentDayData.sort((a, b) => (b.marketCap || b.close) - (a.marketCap || a.close))[0];
      if (topStock) {
        console.log('FORCE BUY:', topStock.ticker, 'price:', topStock.close);
        shares = cash / topStock.close;
        buyPrice = topStock.close;
        buyDate = currentDate;
        buyDayIndex = i;
        highestPrice = buyPrice;
        positionTicker = topStock.ticker;
        cash = 0;
        inPosition = true;
      }
    }

    let shouldSell = false;
    if (inPosition && currentRanks[positionTicker] !== undefined) {
      const daysSinceBuy = i - buyDayIndex;
      const currentRank = currentRanks[positionTicker];
      const rankCondition = useRankChange 
        ? currentRank > (rankChangeTo + sellRank)
        : currentRank > sellRank;
      
      if (rankCondition && daysSinceBuy >= minHoldDays) {
        shouldSell = true;
      }
    }

    if (shouldBuy) {
      const stockToBuy = currentDayData.find(s => s.ticker === buyTicker);
      if (stockToBuy) {
        shares = cash / stockToBuy.close;
        buyPrice = stockToBuy.close;
        buyDate = currentDate;
        buyDayIndex = i;
        highestPrice = buyPrice;
        positionTicker = buyTicker;
        cash = 0;
        inPosition = true;
      }
    }
    
    if (inPosition && shouldSell) {
      const stockToSell = currentDayData.find(s => s.ticker === positionTicker);
      if (stockToSell) {
        const sellPrice = stockToSell.close;
        const profit = (sellPrice - buyPrice) / buyPrice * 100;
        
        const sp500BuyPoint = sp500Data.find(s => s.date === buyDate);
        const sp500SellPoint = sp500Data.find(s => s.date === currentDate);
        let sp500Ret = 0;
        if (sp500BuyPoint && sp500SellPoint) {
          sp500Ret = ((sp500SellPoint.close - sp500BuyPoint.close) / sp500BuyPoint.close) * 100;
        }
        
        trades.push({
          tradeNumber: trades.length + 1,
          ticker: positionTicker,
          buyDate: buyDate,
          buyPrice: buyPrice,
          sellDate: currentDate,
          sellPrice: sellPrice,
          profit: profit,
          sp500Return: sp500Ret,
          shares: shares,
          value: shares * sellPrice
        });
        
        cash = shares * stockToSell.close;
        shares = 0;
        inPosition = false;
        cooldownDays = 3;
        positionTicker = '';
      }
    }

    if (inPosition && buyPrice > 0) {
      const currentStock = currentDayData.find(s => s.ticker === positionTicker);
      if (currentStock) {
        const daysSinceBuy = i - buyDayIndex;
        
        if (currentStock.close > highestPrice) {
          highestPrice = currentStock.close;
        }
        
        const profitPct = (currentStock.close - buyPrice) / buyPrice;
        const trailingStop = (highestPrice - currentStock.close) / highestPrice;
        
        const shouldStopLoss = trailingStop > stopLossPct && daysSinceBuy >= minHoldDays;
        const shouldTakeProfit = profitPct > takeProfitPct && daysSinceBuy >= minHoldDays;
        
        if (shouldStopLoss || shouldTakeProfit) {
          const sellPrice = currentStock.close;
          const profit = (sellPrice - buyPrice) / buyPrice * 100;
          
          const sp500BuyPoint = sp500Data.find(s => s.date === buyDate);
          const sp500SellPoint = sp500Data.find(s => s.date === currentDate);
          let sp500Ret = 0;
          if (sp500BuyPoint && sp500SellPoint) {
            sp500Ret = ((sp500SellPoint.close - sp500BuyPoint.close) / sp500BuyPoint.close) * 100;
          }
          
          trades.push({
            tradeNumber: trades.length + 1,
            ticker: positionTicker,
            buyDate: buyDate,
            buyPrice: buyPrice,
            sellDate: currentDate,
            sellPrice: sellPrice,
            profit: profit,
            sp500Return: sp500Ret,
            shares: shares,
            value: shares * sellPrice
          });
          
          cash = shares * sellPrice;
          shares = 0;
          inPosition = false;
          cooldownDays = shouldTakeProfit ? 0 : 3;
          positionTicker = '';
        }
      }
    }

    const currentStock = currentDayData.find(s => s.ticker === positionTicker);
    let portfolioValue = inPosition && currentStock ? shares * currentStock.close : cash;
    
    const sp500Point = sp500Data.find(s => s.date === currentDate);
    const sp500Start = sp500Data[0]?.close || 1;
    const sp500Value = sp500Start > 0 ? (initialCapital / sp500Start) * (sp500Point?.close || sp500Start) : initialCapital;

    results.push({
      date: currentDate,
      portfolioValue: portfolioValue,
      sp500Value: sp500Value,
      inPosition,
      ticker: positionTicker,
      rank: inPosition && currentStock ? currentRanks[currentStock.ticker] : null,
      rankings: currentRanks
    });
  }

  return { results, trades };
};

const App = () => {
  const [loading, setLoading] = useState(true);
  const [stockData, setStockData] = useState([]);
  const [sp500Data, setSp500Data] = useState([]);
  const [years, setYears] = useState(5);
  const [dataError, setDataError] = useState(null);
  const [buyRank, setBuyRank] = useState(1);
  const [sellRank, setSellRank] = useState(2);
  const [useRankChange, setUseRankChange] = useState(false);
  const [rankChangeFrom, setRankChangeFrom] = useState(4);
  const [rankChangeTo, setRankChangeTo] = useState(3);
  const [minHoldDays, setMinHoldDays] = useState(5);
  const [useMomentum, setUseMomentum] = useState(true);
  const [momentumDays, setMomentumDays] = useState(20);
  const [stopLossPct, setStopLossPct] = useState(15);
  const [takeProfitPct, setTakeProfitPct] = useState(25);
  const [simulationResults, setSimulationResults] = useState(null);
  const [trades, setTrades] = useState([]);
  const [viewMode, setViewMode] = useState('dashboard');
  const [hoveredTrade, setHoveredTrade] = useState(null);
  const [tradeFilter, setTradeFilter] = useState('all');
  const [rankingDate, setRankingDate] = useState(null);
  const [selectedStock, setSelectedStock] = useState(null);
  const [rankingsPage, setRankingsPage] = useState(1);
  const rankingsPerPage = 50;

  const allDates = useMemo(() => {
    if (!stockData.length) return [];
    const dates = new Set();
    stockData.forEach(s => s.data.forEach(d => dates.add(d.date)));
    return Array.from(dates).sort();
  }, [stockData]);

  const selectedDate = rankingDate || (allDates.length > 0 ? allDates[allDates.length - 1] : null);

  useEffect(() => {
    setRankingDate(null);
    setRankingsPage(1);
  }, [years]);

  const rankedStocks = useMemo(() => {
    if (!stockData.length || !selectedDate) return [];
    
    return stockData
      .map(stock => {
        const dayData = stock.data.find(d => d.date === selectedDate);
        if (!dayData) return null;
        
        const weight = (dayData.close || 0) * (dayData.volume || 0);
        
        return {
          ticker: stock.ticker,
          close: dayData.close,
          volume: dayData.volume,
          weight: weight,
          weightPercent: 0,
        };
      })
      .filter(s => s !== null)
      .sort((a, b) => b.weight - a.weight)
      .map((s, idx) => ({ ...s, rank: idx + 1 }));
  }, [stockData, selectedDate]);

  const totalWeight = rankedStocks.reduce((sum, s) => sum + s.weight, 0);
  const rankedStocksWithPercent = rankedStocks.map(s => ({
    ...s,
    weightPercent: totalWeight > 0 ? (s.weight / totalWeight) * 100 : 0
  }));
  const [dataSource, setDataSource] = useState('real');
  const [refreshing, setRefreshing] = useState(false);
  const [dataInfo, setDataInfo] = useState(null);

  const yearsOptions = [1, 2, 3, 5, 10, 15, 20, 25, 30];

  const refreshData = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/refresh-data', { method: 'POST' });
      const result = await res.json();
      if (result.success) {
        loadData();
      }
    } catch (err) {
      console.error('Failed to refresh:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    setDataError(null);

    try {
      if (dataSource === 'real') {
        const res = await fetch(`/api/stock-data?years=${years}`);
        if (!res.ok) throw new Error('No data available');
        const data = await res.json();
        
        const stocks = Object.entries(data.stocks).map(([ticker, dataPoints]) => ({
          ticker,
          data: dataPoints.map(d => ({ date: d.date, close: d.close, volume: d.volume }))
        })).filter(s => s.data.length > 50);
        
        const sp500 = data.sp500
          .map(d => ({ date: d.date, close: d.close }));
        
        setStockData(stocks);
        setSp500Data(sp500);
        setDataInfo(data);
      } else {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const stocks = SP500_TICKERS.slice(0, 50).map((ticker, idx) => ({
          ticker,
          data: generateStockData(ticker, idx, years)
        }));
        
        const sp500 = generateSP500(years);
        
        setStockData(stocks);
        setSp500Data(sp500);
      }
    } catch (err) {
      console.error('Load error:', err);
      setDataError(err.message);
      setDataSource('simulated');
      loadData();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [years, dataSource]);

  useEffect(() => {
    if (stockData.length === 0 || sp500Data.length === 0) return;

    const { results, trades: newTrades } = simulateStrategy(
      stockData, 
      sp500Data, 
      buyRank, 
      sellRank,
      useRankChange,
      rankChangeFrom,
      rankChangeTo,
      minHoldDays,
      useMomentum,
      momentumDays,
      stopLossPct,
      takeProfitPct
    );

    setSimulationResults(results);
    setTrades(newTrades);
  }, [stockData, sp500Data, buyRank, sellRank, useRankChange, rankChangeFrom, rankChangeTo, minHoldDays, useMomentum, momentumDays, stopLossPct, takeProfitPct]);

  const stats = useMemo(() => {
    if (!simulationResults || simulationResults.length === 0) return null;

    const finalValue = simulationResults[simulationResults.length - 1].portfolioValue;
    const initialValue = 10000;
    const returnPct = ((finalValue - initialValue) / initialValue) * 100;

    const sp500Start = sp500Data[0]?.close || 1;
    const sp500End = sp500Data[sp500Data.length - 1]?.close || 1;
    const sp500Return = ((sp500End - sp500Start) / sp500Start) * 100;

    const avgReturn = trades.length > 0 
      ? trades.reduce((sum, t) => sum + t.profit, 0) / trades.length
      : 0;

    const winRate = trades.length > 0 
      ? trades.filter(t => t.profit > 0).length / trades.length * 100
      : 0;

    return {
      finalValue,
      returnPct,
      sp500Return,
      tradesCount: trades.length,
      avgReturn,
      winRate,
      initialValue
    };
  }, [simulationResults, sp500Data, trades]);

  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  const formatFullCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: '#0a0a0f',
      color: '#e4e4e7',
      fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
      padding: '24px',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '32px',
      paddingBottom: '20px',
      borderBottom: '1px solid #27272a',
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    logoIcon: {
      width: '36px',
      height: '36px',
      background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
    },
    logoText: {
      fontSize: '20px',
      fontWeight: '600',
      letterSpacing: '-0.5px',
    },
    logoAccent: {
      color: '#f59e0b',
    },
    headerRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    refreshButton: {
      padding: '8px 16px',
      border: '1px solid #27272a',
      background: 'transparent',
      color: '#a1a1aa',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '12px',
      fontFamily: 'inherit',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      transition: 'all 0.2s ease',
    },
    dataSourceBadge: {
      padding: '4px 10px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '500',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    nav: {
      display: 'flex',
      gap: '4px',
      background: '#18181b',
      padding: '4px',
      borderRadius: '8px',
    },
    navButton: {
      padding: '8px 16px',
      border: 'none',
      background: viewMode === 'dashboard' ? '#27272a' : 'transparent',
      color: viewMode === 'dashboard' ? '#fafafa' : '#71717a',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '13px',
      fontFamily: 'inherit',
      transition: 'all 0.2s ease',
    },
    main: {
      display: 'grid',
      gridTemplateColumns: '320px 1fr',
      gap: '24px',
    },
    sidebar: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    },
    card: {
      background: '#121217',
      border: '1px solid #27272a',
      borderRadius: '12px',
      padding: '20px',
    },
    cardTitle: {
      fontSize: '11px',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      color: '#71717a',
      marginBottom: '16px',
      fontWeight: '500',
    },
    label: {
      fontSize: '12px',
      color: '#a1a1aa',
      marginBottom: '8px',
      display: 'block',
    },
    yearsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '6px',
    },
    yearButton: {
      padding: '8px',
      border: '1px solid #27272a',
      background: years === 0 ? '#27272a' : 'transparent',
      color: years === 0 ? '#fafafa' : '#71717a',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '12px',
      fontFamily: 'inherit',
      transition: 'all 0.15s ease',
    },
    activeYearButton: (year) => ({
      padding: '8px',
      border: '1px solid #f59e0b',
      background: years === year ? '#f59e0b' : 'transparent',
      color: years === year ? '#0a0a0f' : '#f59e0b',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '12px',
      fontFamily: 'inherit',
      fontWeight: '500',
      transition: 'all 0.15s ease',
    }),
    strategyButtons: {
      display: 'flex',
      gap: '6px',
    },
    strategyButton: (active) => ({
      flex: 1,
      padding: '10px',
      border: `1px solid ${active ? '#f59e0b' : '#27272a'}`,
      background: active ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
      color: active ? '#f59e0b' : '#71717a',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '12px',
      fontFamily: 'inherit',
      transition: 'all 0.15s ease',
    }),
    slider: {
      width: '100%',
      marginTop: '8px',
      accentColor: '#f59e0b',
    },
    sliderValue: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '12px',
      color: '#71717a',
      marginTop: '4px',
    },
    content: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '16px',
    },
    statCard: {
      background: '#121217',
      border: '1px solid #27272a',
      borderRadius: '12px',
      padding: '20px',
    },
    statLabel: {
      fontSize: '11px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      color: '#71717a',
      marginBottom: '8px',
    },
    statValue: {
      fontSize: '24px',
      fontWeight: '600',
      letterSpacing: '-0.5px',
    },
    statSubtext: {
      fontSize: '12px',
      color: '#71717a',
      marginTop: '4px',
    },
    positive: {
      color: '#22c55e',
    },
    negative: {
      color: '#ef4444',
    },
    chartContainer: {
      background: '#121217',
      border: '1px solid #27272a',
      borderRadius: '12px',
      padding: '24px',
      height: '400px',
    },
    chartTitle: {
      fontSize: '14px',
      fontWeight: '500',
      marginBottom: '20px',
      color: '#e4e4e7',
    },
    tradesContainer: {
      background: '#121217',
      border: '1px solid #27272a',
      borderRadius: '12px',
      overflow: 'hidden',
    },
    tradesHeader: {
      padding: '20px',
      borderBottom: '1px solid #27272a',
    },
    tradesTitle: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#e4e4e7',
    },
    tradesList: {
      maxHeight: '400px',
      overflowY: 'auto',
    },
    tradeRow: {
      display: 'grid',
      gridTemplateColumns: '40px 70px 1fr 80px 1fr 80px 80px',
      padding: '12px 20px',
      borderBottom: '1px solid #1f1f23',
      fontSize: '12px',
      alignItems: 'center',
      transition: 'background 0.15s ease',
      cursor: 'pointer',
    },
    tradeNumber: {
      color: '#52525b',
    },
    tradeTicker: {
      fontWeight: '600',
      color: '#f59e0b',
    },
    tradeProfit: (profit) => ({
      fontWeight: '500',
      color: profit >= 0 ? '#22c55e' : '#ef4444',
    }),
    loading: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '400px',
      color: '#71717a',
    },
  };

  const chartData = useMemo(() => {
    if (!simulationResults) return [];
    return simulationResults.filter((_, i) => i % Math.ceil(simulationResults.length / 200) === 0);
  }, [simulationResults]);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>📈</div>
            <div style={styles.logoText}>
              <span style={styles.logoAccent}>S&P 500</span> Simulator
            </div>
          </div>
        </div>
        <div style={styles.loading}>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px'}}>
            <div style={{width: '40px', height: '40px', border: '3px solid #27272a', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 1s linear infinite'}}></div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <span>Loading market data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #0a0a0f; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #18181b; }
        ::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #52525b; }
        input[type="range"] {
          -webkit-appearance: none;
          width: 100%;
          height: 6px;
          background: #27272a;
          border-radius: 3px;
          outline: none;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          background: #f59e0b;
          border-radius: 50%;
          cursor: pointer;
          transition: transform 0.15s ease;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }
      `}</style>
      
      <header style={styles.header}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>📈</div>
          <div style={styles.logoText}>
            <span style={styles.logoAccent}>S&P 500</span> Simulator
          </div>
        </div>
        <div style={styles.headerRight}>
          {dataInfo && (
            <span style={{...styles.dataSourceBadge, background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e'}}>
              Real Data ({dataInfo.downloadedAt?.substring(0, 10)})
            </span>
          )}
          <button 
            style={styles.refreshButton}
            onClick={refreshData}
            disabled={refreshing}
          >
            {refreshing ? '⟳ Downloading...' : '↻ Refresh Data'}
          </button>
          <nav style={styles.nav}>
            <button 
              style={styles.navButton} 
              onClick={() => setViewMode('dashboard')}
            >
              Dashboard
            </button>
            <button 
              style={styles.navButton} 
              onClick={() => setViewMode('rankings')}
            >
              Rankings
            </button>
          </nav>
        </div>
      </header>

      <main style={styles.main}>
        <aside style={styles.sidebar}>
          <div style={styles.card}>
            <div style={styles.cardTitle}>Data Period</div>
            <div style={styles.yearsGrid}>
              {yearsOptions.map(year => (
                <button
                  key={year}
                  style={styles.activeYearButton(year)}
                  onClick={() => setYears(year)}
                >
                  {year}y
                </button>
              ))}
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardTitle}>Strategy Type</div>
            <div style={styles.strategyButtons}>
              <button
                style={styles.strategyButton(!useRankChange)}
                onClick={() => setUseRankChange(false)}
              >
                Position Rank
              </button>
              <button
                style={styles.strategyButton(useRankChange)}
                onClick={() => setUseRankChange(true)}
              >
                Rank Change
              </button>
            </div>
          </div>

          {!useRankChange && (
            <div style={styles.card}>
              <div style={styles.cardTitle}>Buy Condition</div>
              <label style={styles.label}>Buy when rank ≤</label>
              <input
                type="range"
                min="1"
                max="10"
                value={buyRank}
                onChange={(e) => setBuyRank(parseInt(e.target.value))}
                style={styles.slider}
              />
              <div style={styles.sliderValue}>
                <span>1</span>
                <span style={{color: '#f59e0b', fontWeight: '600'}}>{buyRank}</span>
                <span>10</span>
              </div>
            </div>
          )}

          {!useRankChange && (
            <div style={styles.card}>
              <div style={styles.cardTitle}>Sell Condition</div>
              <label style={styles.label}>Sell when rank &gt;</label>
              <input
                type="range"
                min="1"
                max="20"
                value={sellRank}
                onChange={(e) => setSellRank(parseInt(e.target.value))}
                style={styles.slider}
              />
              <div style={styles.sliderValue}>
                <span>1</span>
                <span style={{color: '#ef4444', fontWeight: '600'}}>{sellRank}</span>
                <span>20</span>
              </div>
            </div>
          )}

          {useRankChange && (
            <div style={styles.card}>
              <div style={styles.cardTitle}>Buy Condition</div>
              <label style={styles.label}>Buy when rank: →</label>
              <div style={{display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px'}}>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={rankChangeFrom}
                  onChange={(e) => setRankChangeFrom(parseInt(e.target.value))}
                  style={{width: '50px', padding: '6px', background: '#18181b', border: '1px solid #27272a', borderRadius: '4px', color: '#e4e4e7', fontSize: '12px', fontFamily: 'inherit'}}
                />
                <span style={{color: '#71717a'}}>→</span>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={rankChangeTo}
                  onChange={(e) => setRankChangeTo(parseInt(e.target.value))}
                  style={{width: '50px', padding: '6px', background: '#18181b', border: '1px solid #27272a', borderRadius: '4px', color: '#e4e4e7', fontSize: '12px', fontFamily: 'inherit'}}
                />
              </div>
              <label style={styles.label}>Sell when drops</label>
              <input
                type="range"
                min="1"
                max="10"
                value={sellRank}
                onChange={(e) => setSellRank(parseInt(e.target.value))}
                style={styles.slider}
              />
              <div style={styles.sliderValue}>
                <span>1</span>
                <span style={{color: '#f59e0b', fontWeight: '600'}}>{sellRank}</span>
                <span>10</span>
              </div>
            </div>
          )}

          <div style={styles.card}>
            <div style={styles.cardTitle}>Advanced Settings</div>
            
            <label style={styles.label}>Min Hold Days: {minHoldDays}</label>
            <input
              type="range"
              min="1"
              max="20"
              value={minHoldDays}
              onChange={(e) => setMinHoldDays(parseInt(e.target.value))}
              style={styles.slider}
            />
            <div style={styles.sliderValue}>
              <span>1</span>
              <span style={{color: '#f59e0b', fontWeight: '600'}}>{minHoldDays}</span>
              <span>20</span>
            </div>

            <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px', marginBottom: '8px'}}>
              <input
                type="checkbox"
                checked={useMomentum}
                onChange={(e) => setUseMomentum(e.target.checked)}
                style={{accentColor: '#f59e0b'}}
              />
              <span style={{color: '#a1a1aa', fontSize: '12px'}}>Use Momentum Filter</span>
            </div>

            {useMomentum && (
              <>
                <label style={styles.label}>Momentum Days: {momentumDays}</label>
                <input
                  type="range"
                  min="5"
                  max="60"
                  value={momentumDays}
                  onChange={(e) => setMomentumDays(parseInt(e.target.value))}
                  style={styles.slider}
                />
                <div style={styles.sliderValue}>
                  <span>5</span>
                  <span style={{color: '#f59e0b', fontWeight: '600'}}>{momentumDays}</span>
                  <span>60</span>
                </div>
              </>
            )}

            <label style={styles.label}>Stop Loss: {stopLossPct}%</label>
            <input
              type="range"
              min="5"
              max="30"
              value={stopLossPct}
              onChange={(e) => setStopLossPct(parseInt(e.target.value))}
              style={styles.slider}
            />
            <div style={styles.sliderValue}>
              <span>5%</span>
              <span style={{color: '#ef4444', fontWeight: '600'}}>{stopLossPct}%</span>
              <span>30%</span>
            </div>

            <label style={styles.label}>Take Profit: {takeProfitPct}%</label>
            <input
              type="range"
              min="10"
              max="50"
              value={takeProfitPct}
              onChange={(e) => setTakeProfitPct(parseInt(e.target.value))}
              style={styles.slider}
            />
            <div style={styles.sliderValue}>
              <span>10%</span>
              <span style={{color: '#22c55e', fontWeight: '600'}}>{takeProfitPct}%</span>
              <span>50%</span>
            </div>
          </div>

          {stats && (
            <div style={styles.card}>
              <div style={styles.cardTitle}>Quick Stats</div>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                <span style={{color: '#71717a', fontSize: '12px'}}>Total Trades</span>
                <span style={{fontSize: '12px', fontWeight: '500'}}>{stats.tradesCount}</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                <span style={{color: '#71717a', fontSize: '12px'}}>Win Rate</span>
                <span style={{fontSize: '12px', fontWeight: '500', color: stats.winRate >= 50 ? '#22c55e' : '#ef4444'}}>{stats.winRate.toFixed(0)}%</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <span style={{color: '#71717a', fontSize: '12px'}}>Avg Return</span>
                <span style={{fontSize: '12px', fontWeight: '500', color: stats.avgReturn >= 0 ? '#22c55e' : '#ef4444'}}>{stats.avgReturn >= 0 ? '+' : ''}{stats.avgReturn.toFixed(2)}%</span>
              </div>
            </div>
          )}
        </aside>

        {viewMode === 'dashboard' && (
          <div style={styles.content}>
            {stats && (
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Initial Investment</div>
                <div style={styles.statValue}>{formatFullCurrency(stats.initialValue)}</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Final Value</div>
                <div style={{...styles.statValue, color: stats.finalValue >= stats.initialValue ? '#22c55e' : '#ef4444'}}>
                  {formatFullCurrency(stats.finalValue)}
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Strategy Return</div>
                <div style={{...styles.statValue, color: stats.returnPct >= 0 ? '#22c55e' : '#ef4444'}}>
                  {stats.returnPct >= 0 ? '+' : ''}{stats.returnPct.toFixed(2)}%
                </div>
                <div style={styles.statSubtext}>vs S&P 500: {stats.sp500Return >= 0 ? '+' : ''}{stats.sp500Return.toFixed(2)}%</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>vs S&P 500</div>
                <div style={{...styles.statValue, color: (stats.returnPct - stats.sp500Return) >= 0 ? '#22c55e' : '#ef4444'}}>
                  {(stats.returnPct - stats.sp500Return) >= 0 ? '+' : ''}{(stats.returnPct - stats.sp500Return).toFixed(2)}%
                </div>
                <div style={styles.statSubtext}>{stats.tradesCount} trades</div>
              </div>
            </div>
          )}

          <div style={styles.chartContainer}>
            <div style={styles.chartTitle}>Portfolio Performance</div>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorStrategy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSP500" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6b7280" stopOpacity={0.2}/>
                    <stop offset="100%" stopColor="#6b7280" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" />
                <XAxis 
                  dataKey="date" 
                  stroke="#52525b"
                  tick={{fill: '#71717a', fontSize: 10}}
                  tickFormatter={(val) => val.substring(2)}
                  interval={Math.floor(chartData.length / 6)}
                />
                <YAxis 
                  stroke="#52525b"
                  tick={{fill: '#71717a', fontSize: 10}}
                  tickFormatter={formatCurrency}
                  width={60}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: '#18181b', 
                    border: '1px solid #27272a', 
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
                  formatter={(value) => [formatFullCurrency(value), '']}
                  labelFormatter={(label) => formatDate(label)}
                />
                <Area 
                  type="monotone" 
                  dataKey="portfolioValue" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorStrategy)" 
                  name="Strategy"
                />
                <Area 
                  type="monotone" 
                  dataKey="sp500Value" 
                  stroke="#6b7280" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorSP500)" 
                  name="S&P 500"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div style={styles.tradesContainer}>
            <div style={styles.tradesHeader}>
              <div style={styles.tradesTitle}>Trade History</div>
              <div style={{display: 'flex', gap: '4px'}}>
                {['all', 'buy', 'sell'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setTradeFilter(filter)}
                    style={{
                      padding: '4px 12px',
                      border: 'none',
                      background: tradeFilter === filter ? '#f59e0b' : 'transparent',
                      color: tradeFilter === filter ? '#0a0a0f' : '#71717a',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontFamily: 'inherit',
                      textTransform: 'uppercase',
                      fontWeight: '500'
                    }}
                  >
                    {filter === 'all' ? 'All' : filter === 'buy' ? 'Buys' : 'Sells'}
                  </button>
                ))}
              </div>
            </div>
            <div style={styles.tradesList}>
              <div style={{...styles.tradeRow, background: '#18181b', fontWeight: '500', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#71717a'}}>
                <span>#</span>
                <span>Ticker</span>
                <span>Buy Date</span>
                <span>Buy Price</span>
                <span>Sell Date</span>
                <span>Sell Price</span>
                <span>Return</span>
              </div>
              {trades
                .filter(t => {
                  if (tradeFilter === 'buy') return t.profit === undefined || t.profit === null;
                  if (tradeFilter === 'sell') return t.profit !== undefined && t.profit !== null;
                  return true;
                })
                .slice(-30).reverse().map((trade, idx) => (
                <div 
                  key={idx}
                  style={styles.tradeRow}
                  onMouseEnter={() => setHoveredTrade(trade.tradeNumber)}
                  onMouseLeave={() => setHoveredTrade(null)}
                >
                  <span style={styles.tradeNumber}>{trade.tradeNumber}</span>
                  <span style={styles.tradeTicker}>{trade.ticker}</span>
                  <span style={{color: '#a1a1aa', fontSize: '12px'}}>{trade.buyDate ? formatDate(trade.buyDate) : '-'}</span>
                  <span style={{color: '#52525b', fontSize: '12px'}}>{trade.buyPrice ? `$${trade.buyPrice.toFixed(2)}` : '-'}</span>
                  <span style={{color: '#a1a1aa', fontSize: '12px'}}>{trade.sellDate ? formatDate(trade.sellDate) : '-'}</span>
                  <span style={{color: '#52525b', fontSize: '12px'}}>{trade.sellPrice ? `$${trade.sellPrice.toFixed(2)}` : '-'}</span>
                  <span style={styles.tradeProfit(trade.profit)}>
                    {trade.profit !== undefined ? (trade.profit >= 0 ? '+' : '') + trade.profit.toFixed(2) + '%' : '-'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        )}

        {viewMode === 'rankings' && stockData.length > 0 && (
        <div style={styles.content}>
          <div style={styles.card}>
            <div style={styles.cardTitle}>Stock Rankings by Weighted Market Cap</div>
            
            <div style={{marginBottom: '20px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
                <span style={{color: '#71717a', fontSize: '12px'}}>Browse by Date</span>
                <span style={{color: '#f59e0b', fontWeight: '600', fontSize: '14px'}}>{selectedDate}</span>
              </div>
              <input
                type="range"
                min="0"
                max={allDates.length - 1}
                value={allDates.indexOf(selectedDate)}
                onChange={(e) => setRankingDate(allDates[parseInt(e.target.value)])}
                style={{width: '100%', accentColor: '#f59e0b'}}
              />
              <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '8px'}}>
                <button
                  onClick={() => setRankingDate(allDates[0])}
                  style={{background: 'none', border: 'none', color: '#52525b', cursor: 'pointer', fontSize: '11px'}}
                >
                  ← Start
                </button>
                <button
                  onClick={() => {
                    const mid = Math.floor(allDates.length * 0.5);
                    setRankingDate(allDates[mid]);
                  }}
                  style={{background: 'none', border: 'none', color: '#52525b', cursor: 'pointer', fontSize: '11px'}}
                >
                  Mid
                </button>
                <button
                  onClick={() => setRankingDate(allDates[allDates.length - 1])}
                  style={{background: 'none', border: 'none', color: '#52525b', cursor: 'pointer', fontSize: '11px'}}
                >
                  Latest →
                </button>
              </div>
            </div>

            <div style={{maxHeight: '500px', overflowY: 'auto'}}>
              <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '12px'}}>
                <thead style={{position: 'sticky', top: 0, background: '#121217'}}>
                  <tr style={{color: '#71717a', textTransform: 'uppercase', fontSize: '10px'}}>
                    <th style={{padding: '8px', textAlign: 'left', width: '40px'}}>#</th>
                    <th style={{padding: '8px', textAlign: 'left', width: '70px'}}>Ticker</th>
                    <th style={{padding: '8px', textAlign: 'right'}}>Price</th>
                    <th style={{padding: '8px', textAlign: 'right'}}>Volume</th>
                    <th style={{padding: '8px', textAlign: 'right'}}>Weight</th>
                    <th style={{padding: '8px', textAlign: 'right'}}>Weight %</th>
                  </tr>
                </thead>
                <tbody>
                  {rankedStocksWithPercent
                    .slice((rankingsPage - 1) * rankingsPerPage, rankingsPage * rankingsPerPage)
                    .map((stock) => {
                    const stockDataFull = stockData.find(s => s.ticker === stock.ticker);
                    return (
                    <tr 
                      key={stock.ticker} 
                      onClick={() => stockDataFull && setSelectedStock(stockDataFull)}
                      style={{borderBottom: '1px solid #1f1f23', cursor: 'pointer'}}
                    >
                      <td style={{padding: '10px 8px', color: stock.rank <= 10 ? '#f59e0b' : '#52525b', fontWeight: stock.rank <= 10 ? '600' : '400'}}>{stock.rank}</td>
                      <td style={{padding: '10px 8px', fontWeight: '600', color: '#e4e4e7'}}>{stock.ticker}</td>
                      <td style={{padding: '10px 8px', textAlign: 'right', color: '#a1a1aa'}}>${stock.close?.toFixed(2)}</td>
                      <td style={{padding: '10px 8px', textAlign: 'right', color: '#a1a1aa'}}>{(stock.volume / 1000000).toFixed(2)}M</td>
                      <td style={{padding: '10px 8px', textAlign: 'right', color: '#71717a'}}>{(stock.weight / 1000000000).toFixed(2)}B</td>
                      <td style={{padding: '10px 8px', textAlign: 'right'}}>
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px'}}>
                          <div style={{width: '60px', height: '4px', background: '#27272a', borderRadius: '2px', overflow: 'hidden'}}>
                            <div style={{width: `${Math.min(stock.weightPercent, 100)}%`, height: '100%', background: stock.weightPercent > 3 ? '#f59e0b' : '#52525b'}}></div>
                          </div>
                          <span style={{color: stock.weightPercent > 3 ? '#f59e0b' : '#52525b', fontSize: '11px', minWidth: '40px', textAlign: 'right'}}>{stock.weightPercent.toFixed(2)}%</span>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
              {rankedStocksWithPercent.length > rankingsPerPage && (
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', padding: '16px', borderTop: '1px solid #27272a'}}>
                  <button 
                    onClick={() => setRankingsPage(p => Math.max(1, p - 1))}
                    disabled={rankingsPage === 1}
                    style={{background: 'none', border: '1px solid #27272a', color: rankingsPage === 1 ? '#52525b' : '#a1a1aa', padding: '6px 12px', borderRadius: '4px', cursor: rankingsPage === 1 ? 'not-allowed' : 'pointer', fontSize: '12px'}}
                  >
                    ← Prev
                  </button>
                  <span style={{color: '#71717a', fontSize: '12px'}}>
                    Page {rankingsPage} of {Math.ceil(rankedStocksWithPercent.length / rankingsPerPage)}
                  </span>
                  <button 
                    onClick={() => setRankingsPage(p => Math.min(Math.ceil(rankedStocksWithPercent.length / rankingsPerPage), p + 1))}
                    disabled={rankingsPage >= Math.ceil(rankedStocksWithPercent.length / rankingsPerPage)}
                    style={{background: 'none', border: '1px solid #27272a', color: rankingsPage >= Math.ceil(rankedStocksWithPercent.length / rankingsPerPage) ? '#52525b' : '#a1a1aa', padding: '6px 12px', borderRadius: '4px', cursor: rankingsPage >= Math.ceil(rankedStocksWithPercent.length / rankingsPerPage) ? 'not-allowed' : 'pointer', fontSize: '12px'}}
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardTitle}>Data Verification</div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
              <div>
                <div style={{color: '#71717a', fontSize: '11px', marginBottom: '4px'}}>Total Stocks</div>
                <div style={{fontSize: '20px', fontWeight: '600', color: '#f59e0b'}}>{stockData.length}</div>
              </div>
              <div>
                <div style={{color: '#71717a', fontSize: '11px', marginBottom: '4px'}}>S&P 500 Data Points</div>
                <div style={{fontSize: '20px', fontWeight: '600', color: '#22c55e'}}>{sp500Data.length}</div>
              </div>
              <div>
                <div style={{color: '#71717a', fontSize: '11px', marginBottom: '4px'}}>Date Range</div>
                <div style={{fontSize: '14px', color: '#a1a1aa'}}>
                  {sp500Data[0]?.date || 'N/A'} → {sp500Data[sp500Data.length-1]?.date || 'N/A'}
                </div>
              </div>
              <div>
                <div style={{color: '#71717a', fontSize: '11px', marginBottom: '4px'}}>Data Source</div>
                <div style={{fontSize: '14px', color: dataInfo ? '#22c55e' : '#71717a'}}>
                  {dataInfo ? `Real (${dataInfo.downloadedAt?.substring(0, 10)})` : 'Simulated'}
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {selectedStock && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}} onClick={() => setSelectedStock(null)}>
          <div style={{background: '#121217', border: '1px solid #27272a', borderRadius: '12px', padding: '24px', maxWidth: '800px', width: '90%', maxHeight: '90vh', overflow: 'auto'}} onClick={e => e.stopPropagation()}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
              <div>
                <h2 style={{margin: 0, color: '#f59e0b', fontSize: '24px'}}>{selectedStock.ticker}</h2>
                <span style={{color: '#71717a', fontSize: '14px'}}>Stock Detail</span>
              </div>
              <button onClick={() => setSelectedStock(null)} style={{background: 'none', border: 'none', color: '#71717a', fontSize: '24px', cursor: 'pointer'}}>×</button>
            </div>
            
            {(() => {
              const stockInfo = rankedStocksWithPercent.find(s => s.ticker === selectedStock.ticker);
              const latestPrice = selectedStock.data[selectedStock.data.length - 1]?.close;
              const earliestPrice = selectedStock.data[0]?.close;
              const priceChange = earliestPrice ? ((latestPrice - earliestPrice) / earliestPrice) * 100 : 0;
              
              return (
                <>
                  <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px'}}>
                    <div style={{background: '#18181b', padding: '16px', borderRadius: '8px'}}>
                      <div style={{color: '#71717a', fontSize: '11px', marginBottom: '4px'}}>Current Price</div>
                      <div style={{color: '#22c55e', fontSize: '20px', fontWeight: '600'}}>${latestPrice?.toFixed(2)}</div>
                    </div>
                    <div style={{background: '#18181b', padding: '16px', borderRadius: '8px'}}>
                      <div style={{color: '#71717a', fontSize: '11px', marginBottom: '4px'}}>Change</div>
                      <div style={{color: priceChange >= 0 ? '#22c55e' : '#ef4444', fontSize: '20px', fontWeight: '600'}}>{priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%</div>
                    </div>
                    <div style={{background: '#18181b', padding: '16px', borderRadius: '8px'}}>
                      <div style={{color: '#71717a', fontSize: '11px', marginBottom: '4px'}}>Current Weight</div>
                      <div style={{color: '#f59e0b', fontSize: '20px', fontWeight: '600'}}>{stockInfo?.weightPercent?.toFixed(2)}%</div>
                    </div>
                    <div style={{background: '#18181b', padding: '16px', borderRadius: '8px'}}>
                      <div style={{color: '#71717a', fontSize: '11px', marginBottom: '4px'}}>Data Points</div>
                      <div style={{color: '#a1a1aa', fontSize: '20px', fontWeight: '600'}}>{selectedStock.data.length}</div>
                    </div>
                  </div>
                  
                  <div style={{marginBottom: '24px'}}>
                    <div style={{color: '#71717a', fontSize: '12px', marginBottom: '12px'}}>Price History</div>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={selectedStock.data.filter((_, i) => i % Math.ceil(selectedStock.data.length / 200) === 0)}>
                        <defs>
                          <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3}/>
                            <stop offset="100%" stopColor="#f59e0b" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#52525b"
                          tick={{fill: '#71717a', fontSize: 10}}
                          tickFormatter={(val) => val.substring(2)}
                        />
                        <YAxis 
                          stroke="#52525b"
                          tick={{fill: '#71717a', fontSize: 10}}
                          tickFormatter={(val) => `$${val}`}
                          domain={['auto', 'auto']}
                        />
                        <Tooltip 
                          contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '12px' }}
                          formatter={(value) => [`$${value.toFixed(2)}`, 'Price']}
                          labelFormatter={(label) => formatDate(label)}
                        />
                        <Area type="monotone" dataKey="close" stroke="#f59e0b" strokeWidth={2} fill="url(#colorStock)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div>
                    <div style={{color: '#71717a', fontSize: '12px', marginBottom: '12px'}}>Recent Data Points</div>
                    <div style={{maxHeight: '200px', overflowY: 'auto'}}>
                      <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '11px'}}>
                        <thead style={{position: 'sticky', top: 0, background: '#121217'}}>
                          <tr style={{color: '#71717a'}}>
                            <th style={{padding: '8px', textAlign: 'left'}}>Date</th>
                            <th style={{padding: '8px', textAlign: 'right'}}>Close</th>
                            <th style={{padding: '8px', textAlign: 'right'}}>Volume</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedStock.data.slice(-20).reverse().map((d, i) => (
                            <tr key={i} style={{borderBottom: '1px solid #1f1f23'}}>
                              <td style={{padding: '6px 8px', color: '#a1a1aa'}}>{formatDate(d.date)}</td>
                              <td style={{padding: '6px 8px', textAlign: 'right', color: '#22c55e'}}>${d.close?.toFixed(2)}</td>
                              <td style={{padding: '6px 8px', textAlign: 'right', color: '#71717a'}}>{(d.volume / 1000000).toFixed(2)}M</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
        )}
      </main>
    </div>
  );
};

export default App;
