import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, ReferenceDot } from 'recharts';

const SP500_TICKERS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK.B', 'UNH', 'JNJ',
  'V', 'XOM', 'JPM', 'WMT', 'MA', 'PG', 'CVX', 'HD', 'LLY', 'ABBV',
  'MRK', 'PFE', 'AVGO', 'KO', 'PEP', 'COST', 'TMO', 'MCD', 'CSCO', 'ACN',
  'ABT', 'DHR', 'WFC', 'NKE', 'ADBE', 'CRM', 'TXN', 'NEE', 'PM', 'BMY',
  'DIS', 'UNP', 'VZ', 'RTX', 'HON', 'INTC', 'ORCL', 'AMD', 'IBM', 'QCOM'
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

const generateSP500Data = (stockData) => {
  const allDates = [...new Set(stockData.flatMap(s => s.data.map(d => d.date)))].sort();
  
  let indexValue = 4000;
  return allDates.map(date => {
    const change = (Math.random() - 0.48) * 0.012 + 0.0002;
    indexValue = indexValue * (1 + change);
    return {
      date,
      close: indexValue
    };
  });
};

const simulateStrategy = (allStocks, sp500Data, buyRank, sellRank, useRankChange = false, rankChangeFrom = 4, rankChangeTo = 3) => {
  if (!allStocks || allStocks.length === 0) return null;

  const results = [];
  const trades = [];
  let cash = 10000;
  let shares = 0;
  let inPosition = false;
  let positionTicker = '';
  let buyPrice = 0;
  let buyDate = '';

  const allDates = [...new Set(allStocks.flatMap(s => s.data.map(d => d.date)))].sort();
  const startIdx = allDates.findIndex(d => {
    const hasData = allStocks.every(s => s.data.some(sd => sd.date === d));
    return hasData;
  });

  const validDates = allDates.slice(Math.max(startIdx, 30), allDates.length);

  for (let i = 0; i < validDates.length; i++) {
    const currentDate = validDates[i];
    
    const currentDayData = allStocks.map(s => {
      const dayData = s.data.find(d => d.date === currentDate);
      return dayData ? { ticker: s.ticker, close: dayData.close, marketCap: dayData.marketCap, date: dayData.date } : null;
    }).filter(d => d !== null);

    const prevDate = i > 0 ? validDates[i - 1] : null;
    const prevDayData = prevDate ? allStocks.map(s => {
      const dayData = s.data.find(d => d.date === prevDate);
      return dayData ? { ticker: s.ticker, close: dayData.close, marketCap: dayData.marketCap, date: dayData.date } : null;
    }).filter(d => d !== null) : [];

    if (currentDayData.length < 10) continue;

    const currentSorted = [...currentDayData].sort((a, b) => (b.marketCap || b.close) - (a.marketCap || a.close));
    const currentRanks = {};
    currentSorted.forEach((s, idx) => { currentRanks[s.ticker] = idx + 1; });

    const prevSorted = prevDayData.length > 0 ? [...prevDayData].sort((a, b) => (b.marketCap || b.close) - (a.marketCap || a.close)) : [];
    const prevRanks = {};
    prevSorted.forEach((s, idx) => { prevRanks[s.ticker] = idx + 1; });

    let shouldBuy = false;
    let buyTicker = '';

    if (!inPosition) {
      if (useRankChange && prevDate) {
        for (const ticker of Object.keys(prevRanks)) {
          if (prevRanks[ticker] === rankChangeFrom && currentRanks[ticker] === rankChangeTo) {
            shouldBuy = true;
            buyTicker = ticker;
            break;
          }
        }
      } else {
        for (const ticker of Object.keys(currentRanks)) {
          if (prevRanks[ticker] !== undefined && prevRanks[ticker] <= buyRank && currentRanks[ticker] === buyRank) {
            shouldBuy = true;
            buyTicker = ticker;
            break;
          }
        }
      }
    }

    let shouldSell = false;
    if (inPosition && currentRanks[positionTicker] !== undefined) {
      if (useRankChange) {
        const currentRank = currentRanks[positionTicker];
        shouldSell = currentRank > (rankChangeTo + sellRank);
      } else {
        shouldSell = currentRanks[positionTicker] > sellRank;
      }
    }

    let executedTrade = false;

    if (shouldBuy) {
      const stockToBuy = currentDayData.find(s => s.ticker === buyTicker);
      if (stockToBuy) {
        shares = cash / stockToBuy.close;
        buyPrice = stockToBuy.close;
        buyDate = currentDate;
        positionTicker = buyTicker;
        cash = 0;
        inPosition = true;
        executedTrade = true;
      }
    }
    
    if (inPosition && shouldSell) {
      const stockToSell = currentDayData.find(s => s.ticker === positionTicker);
      if (stockToSell) {
        const sellPrice = stockToSell.close;
        const profit = (sellPrice - buyPrice) / buyPrice * 100;
        
        const sp500BuyPoint = sp500Data.find(s => s.date === buyDate);
        const sp500SellPoint = sp500Data.find(s => s.date === currentDate);
        let sp500Return = 0;
        if (sp500BuyPoint && sp500SellPoint) {
          sp500Return = ((sp500SellPoint.close - sp500BuyPoint.close) / sp500BuyPoint.close) * 100;
        }
        
        trades.push({
          tradeNumber: trades.length + 1,
          ticker: positionTicker,
          buyDate: buyDate,
          buyPrice: buyPrice,
          sellDate: currentDate,
          sellPrice: sellPrice,
          profit: profit,
          sp500Return: sp500Return,
          shares: shares,
          value: shares * sellPrice
        });
        cash = shares * stockToSell.close;
        shares = 0;
        inPosition = false;
        positionTicker = '';
        executedTrade = true;
        
        if (useRankChange) {
          for (const ticker of Object.keys(currentRanks)) {
            if (prevRanks[ticker] !== undefined && prevRanks[ticker] === rankChangeFrom && currentRanks[ticker] === rankChangeTo) {
              shouldBuy = true;
              buyTicker = ticker;
              break;
            }
          }
        } else {
          for (const ticker of Object.keys(currentRanks)) {
            if (prevRanks[ticker] !== undefined && prevRanks[ticker] <= buyRank && currentRanks[ticker] === buyRank) {
              shouldBuy = true;
              buyTicker = ticker;
              break;
            }
          }
        }
        
        if (shouldBuy) {
          const stockToBuy = currentDayData.find(s => s.ticker === buyTicker);
          if (stockToBuy) {
            shares = cash / stockToBuy.close;
            buyPrice = stockToBuy.close;
            buyDate = currentDate;
            positionTicker = buyTicker;
            cash = 0;
            inPosition = true;
          }
        }
      }
    }

    if (inPosition && buyPrice > 0) {
      const currentStock = currentDayData.find(s => s.ticker === positionTicker);
      if (currentStock) {
        const profitPct = (currentStock.close - buyPrice) / buyPrice;
        if (profitPct > 0.2 || profitPct < -0.1) {
          const sellPrice = currentStock.close;
          const profit = (sellPrice - buyPrice) / buyPrice * 100;
          
          const sp500BuyPoint = sp500Data.find(s => s.date === buyDate);
          const sp500SellPoint = sp500Data.find(s => s.date === currentDate);
          let sp500Return = 0;
          if (sp500BuyPoint && sp500SellPoint) {
            sp500Return = ((sp500SellPoint.close - sp500BuyPoint.close) / sp500BuyPoint.close) * 100;
          }
          
          trades.push({
            tradeNumber: trades.length + 1,
            ticker: positionTicker,
            buyDate: buyDate,
            buyPrice: buyPrice,
            sellDate: currentDate,
            sellPrice: sellPrice,
            profit: profit,
            sp500Return: sp500Return,
            shares: shares,
            value: shares * sellPrice
          });
          cash = shares * currentStock.close;
          shares = 0;
          inPosition = false;
          positionTicker = '';
          
          if (useRankChange) {
            for (const ticker of Object.keys(currentRanks)) {
              if (prevRanks[ticker] !== undefined && prevRanks[ticker] === rankChangeFrom && currentRanks[ticker] === rankChangeTo) {
                shouldBuy = true;
                buyTicker = ticker;
                break;
              }
            }
          } else {
            for (const ticker of Object.keys(currentRanks)) {
              if (prevRanks[ticker] !== undefined && prevRanks[ticker] <= buyRank && currentRanks[ticker] === buyRank) {
                shouldBuy = true;
                buyTicker = ticker;
                break;
              }
            }
          }
          
          if (shouldBuy) {
            const stockToBuy = currentDayData.find(s => s.ticker === buyTicker);
            if (stockToBuy) {
              shares = cash / stockToBuy.close;
              buyPrice = stockToBuy.close;
              buyDate = currentDate;
              positionTicker = buyTicker;
              cash = 0;
              inPosition = true;
            }
          }
        }
      }
    }

    const currentStock = currentDayData.find(s => s.ticker === positionTicker);
    let portfolioValue = inPosition && currentStock ? shares * currentStock.close : cash;
    
    const sp500Point = sp500Data.find(s => s.date === currentDate);
    const sp500Start = sp500Data[0]?.close || 1;
    const sp500Normalized = sp500Point ? (portfolioValue / 10000) * sp500Point.close / sp500Start * 10000 : null;

    results.push({
      date: currentDate,
      portfolioValue: portfolioValue,
      sp500Normalized: sp500Normalized,
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
  const [years, setYears] = useState(25);
  const [dataError, setDataError] = useState(null);
  const [buyRank, setBuyRank] = useState(1);
  const [sellRank, setSellRank] = useState(2);
  const [useRankChange, setUseRankChange] = useState(false);
  const [rankChangeFrom, setRankChangeFrom] = useState(4);
  const [rankChangeTo, setRankChangeTo] = useState(3);
  const [simulationResults, setSimulationResults] = useState(null);
  const [trades, setTrades] = useState([]);
  const [showTradeMarkers, setShowTradeMarkers] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dataInfo, setDataInfo] = useState(null);
  const [viewMode, setViewMode] = useState('dashboard');

  const yearsOptions = [1, 2, 3, 5, 10, 15, 20, 25];

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setDataError(null);
      setDataInfo({
        source: 'Simulated Data',
        years: years
      });

      await new Promise(resolve => setTimeout(resolve, 500));

      const stocks = SP500_TICKERS.slice(0, 50).map((ticker, idx) => ({
        ticker,
        data: generateStockData(ticker, idx, years)
      }));

      setStockData(stocks);
      setSp500Data(generateSP500Data(stocks));
      setLoading(false);
    };

    loadData();
  }, [years]);

  useEffect(() => {
    if (stockData.length > 0 && sp500Data.length > 0) {
      const { results, trades } = simulateStrategy(
        stockData,
        sp500Data,
        buyRank,
        sellRank,
        useRankChange,
        rankChangeFrom,
        rankChangeTo
      );
      setSimulationResults(results);
      setTrades(trades);
      if (results && results.length > 0) {
        setSelectedDate(results[results.length - 1].date);
      }
    }
  }, [stockData, sp500Data, buyRank, sellRank, useRankChange, rankChangeFrom, rankChangeTo]);

  const stats = useMemo(() => {
    if (!simulationResults || simulationResults.length === 0) return null;

    const finalValue = simulationResults[simulationResults.length - 1].portfolioValue;
    const initialValue = 10000;
    const returnPct = ((finalValue - initialValue) / initialValue) * 100;

    const sp500Start = sp500Data[0]?.close || 1;
    const sp500End = sp500Data[sp500Data.length - 1]?.close || 1;
    const sp500Return = ((sp500End - sp500Start) / sp500Start) * 100;

    let tradesCount = trades.length;
    let inPos = false;
    trades.forEach(r => {
      if (r.inPosition && !inPos) { tradesCount++; inPos = true; }
      if (!r.inPosition) inPos = false;
    });

    const avgReturn = trades.length > 0 
      ? trades.reduce((sum, t) => sum + t.profit, 0) / trades.length
      : 0;

    const winRate = trades.length > 0 
      ? trades.filter(t => t.profit > 0).length / trades.length * 100
      : 0;

    return {
      finalValue: finalValue.toFixed(2),
      returnPct: returnPct.toFixed(2),
      sp500Return: sp500Return.toFixed(2),
      tradesCount,
      avgReturn: avgReturn.toFixed(2),
      winRate: winRate.toFixed(0),
      initialValue
    };
  }, [simulationResults, sp500Data, trades]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const navigateDate = useCallback((direction) => {
    if (!simulationResults || simulationResults.length === 0) return;
    const currentIndex = simulationResults.findIndex(r => r.date === selectedDate);
    const newIndex = direction === 'prev' ? Math.max(0, currentIndex - 10) : Math.min(simulationResults.length - 1, currentIndex + 10);
    setSelectedDate(simulationResults[newIndex].date);
  }, [simulationResults, selectedDate]);

  const RankingsCard = ({ stockData, date }) => {
    if (!stockData || stockData.length === 0 || !date) return null;

    const dayData = stockData.map(s => {
      const dayData = s.data.find(d => d.date === date);
      return dayData ? {
        ticker: s.ticker,
        close: dayData.close,
        rank: 0
      } : null;
    }).filter(d => d !== null);

    const sorted = [...dayData].sort((a, b) => b.close - a.close);
    sorted.forEach((s, idx) => s.rank = idx + 1);

    return (
      <div style={styles.rankingsCard}>
        <div style={styles.rankingsHeader}>
          <h4 style={styles.rankingsTitle}>Market Rankings</h4>
          <span style={styles.rankingsDate}>{formatDate(date)}</span>
        </div>
        <div style={styles.rankingsNav}>
          <button
            style={{...styles.rankingsNavButton, opacity: !simulationResults || simulationResults.findIndex(r => r.date === date) <= 9 ? 0.5 : 1}}
            onClick={() => navigateDate('prev')}
            disabled={!simulationResults || simulationResults.findIndex(r => r.date === date) <= 9}
          >
            ← Prev
          </button>
          <button
            style={{...styles.rankingsNavButton, opacity: !simulationResults || simulationResults.findIndex(r => r.date === date) >= simulationResults.length - 10 ? 0.5 : 1}}
            onClick={() => navigateDate('next')}
            disabled={!simulationResults || simulationResults.findIndex(r => r.date === date) >= simulationResults.length - 10}
          >
            Next →
          </button>
        </div>
        <div style={styles.rankingsTableContainer}>
          <table style={styles.rankingsTable}>
            <thead>
              <tr>
                <th style={styles.rankingsTh}>Rank</th>
                <th style={styles.rankingsTh}>Ticker</th>
                <th style={styles.rankingsTh}>Price</th>
                <th style={styles.rankingsTh}>Change</th>
              </tr>
            </thead>
            <tbody>
              {sorted.slice(0, 15).map((stock, idx) => {
                const prevPrice = sorted[idx - 1]?.close || stock.close;
                const change = ((stock.close - prevPrice) / prevPrice) * 100;
                return (
                  <tr key={stock.ticker}>
                    <td style={{...styles.rankingsTd, fontWeight: '600', color: stock.rank <= 10 ? '#fbbf24' : 'inherit'}}>
                      {stock.rank}
                    </td>
                    <td style={styles.rankingsTickerCell}>{stock.ticker}</td>
                    <td style={styles.rankingsTd}>${stock.close.toFixed(2)}</td>
                    <td style={{...styles.rankingsTd, color: change >= 0 ? '#22c55e' : '#ef4444'}}>
                      {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loader}></div>
        <p style={styles.loadingText}>Loading market data...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <div style={styles.navLogo}>
          <span style={styles.navLogoIcon}>📊</span>
          <span style={styles.navLogoText}>S&P 500 Simulator</span>
        </div>
        <div style={styles.navControls}>
          <button
            style={{...styles.navButton, ...(viewMode === 'dashboard' && styles.navButtonActive)}}
            onClick={() => setViewMode('dashboard')}
          >
            Dashboard
          </button>
          <button
            style={{...styles.navButton, ...(viewMode === 'rankings' && styles.navButtonActive)}}
            onClick={() => setViewMode('rankings')}
          >
            Rankings
          </button>
        </div>
      </nav>

      <main style={styles.main}>
        {dataError && (
          <div style={styles.errorBanner}>{dataError}</div>
        )}

        <div style={styles.configSection}>
          <div style={styles.configHeader}>
            <h2 style={styles.configTitle}>Strategy Configuration</h2>
            <span style={styles.configSubtitle}>{years} years of historical data</span>
          </div>

          <div style={styles.configGrid}>
            <div style={styles.configCard}>
              <label style={styles.configLabel}>Data Period</label>
              <div style={styles.yearsSelector}>
                {yearsOptions.map(y => (
                  <button
                    key={y}
                    style={{
                      ...styles.yearButton,
                      ...(years === y && styles.yearButtonActive)
                    }}
                    onClick={() => setYears(y)}
                  >
                    {y}y
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={styles.configCard}>
            <label style={styles.configLabel}>Strategy Type</label>
            <div style={styles.strategyToggle}>
              <button
                style={{...styles.strategyButton, ...(!useRankChange && styles.strategyButtonActive)}}
                onClick={() => setUseRankChange(false)}
              >
                Position Rank
              </button>
              <button
                style={{...styles.strategyButton, ...(useRankChange && styles.strategyButtonActive)}}
                onClick={() => setUseRankChange(true)}
              >
                Rank Change
              </button>
            </div>
          </div>

          {!useRankChange ? (
            <>
              <div style={styles.configCard}>
                <label style={styles.configLabel}>Buy when rank ≤</label>
                <div style={styles.rangeContainer}>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={buyRank}
                    onChange={(e) => setBuyRank(Number(e.target.value))}
                    style={styles.range}
                  />
                  <span style={styles.rangeValue}>{buyRank}</span>
                </div>
              </div>

              <div style={styles.configCard}>
                <label style={styles.configLabel}>Sell when rank &gt;</label>
                <div style={styles.rangeContainer}>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={sellRank}
                    onChange={(e) => setSellRank(Number(e.target.value))}
                    style={styles.range}
                  />
                  <span style={styles.rangeValue}>{sellRank}</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div style={styles.configCard}>
                <label style={styles.configLabel}>Buy when rank {rankChangeFrom} → {rankChangeTo}</label>
                <div style={styles.rangeContainer}>
                  <input
                    type="range"
                    min="1"
                    max="25"
                    value={rankChangeFrom}
                    onChange={(e) => setRankChangeFrom(Number(e.target.value))}
                    style={styles.range}
                  />
                  <span style={styles.rangeValue}>{rankChangeFrom}</span>
                  <span style={styles.rangeArrow}>→</span>
                  <input
                    type="range"
                    min="1"
                    max="25"
                    value={rankChangeTo}
                    onChange={(e) => setRankChangeTo(Number(e.target.value))}
                    style={styles.range}
                  />
                  <span style={styles.rangeValue}>{rankChangeTo}</span>
                </div>
              </div>

              <div style={styles.configCard}>
                <label style={styles.configLabel}>Sell when rank drops</label>
                <div style={styles.rangeContainer}>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={sellRank}
                    onChange={(e) => setSellRank(Number(e.target.value))}
                    style={styles.range}
                  />
                  <span style={styles.rangeValue}>{sellRank}</span>
                </div>
              </div>
            </>
          )}

          <div style={styles.configCard}>
            <label style={styles.configLabel}>Display</label>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={showTradeMarkers}
                onChange={(e) => setShowTradeMarkers(e.target.checked)}
                style={styles.checkbox}
              />
              Show Trade Markers
            </label>
          </div>
        </div>

        {stats && (
          <div style={styles.statsSection}>
            <h3 style={styles.sectionTitle}>Performance Summary</h3>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <span style={styles.statLabel}>Initial Investment</span>
                <span style={styles.statValue}>${stats.initialValue.toLocaleString()}</span>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statLabel}>Final Value</span>
                <span style={{...styles.statValue, color: parseFloat(stats.returnPct) >= 0 ? '#22c55e' : '#ef4444'}}>
                  ${parseFloat(stats.finalValue).toLocaleString(undefined, {maximumFractionDigits: 0 })}
                </span>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statLabel}>Strategy Return</span>
                <span style={{...styles.statValue, color: parseFloat(stats.returnPct) >= 0 ? '#22c55e' : '#ef4444'}}>
                  {parseFloat(stats.returnPct) >= 0 ? '+' : ''}{stats.returnPct}%
                </span>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statLabel}>S&P 500 Return</span>
                <span style={{...styles.statValue, color: parseFloat(stats.sp500Return) >= 0 ? '#22c55e' : '#ef4444'}}>
                  {parseFloat(stats.sp500Return) >= 0 ? '+' : ''}{stats.sp500Return}%
                </span>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statLabel}>vs Market</span>
                <span style={{...styles.statValue, color: (parseFloat(stats.returnPct) - parseFloat(stats.sp500Return)) >= 0 ? '#22c55e' : '#ef4444'}}>
                  {(parseFloat(stats.returnPct) - parseFloat(stats.sp500Return)) >= 0 ? '+' : ''}{(parseFloat(stats.returnPct) - parseFloat(stats.sp500Return)).toFixed(2)}%
                </span>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statLabel}>Total Trades</span>
                <span style={styles.statValue}>{stats.tradesCount}</span>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statLabel}>Avg Return</span>
                <span style={{...styles.statValue, color: parseFloat(stats.avgReturn) >= 0 ? '#22c55e' : '#ef4444'}}>
                  {parseFloat(stats.avgReturn) >= 0 ? '+' : ''}{stats.avgReturn}%
                </span>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statLabel}>Win Rate</span>
                <span style={{...styles.statValue, color: parseFloat(stats.winRate) >= 50 ? '#22c55e' : '#ef4444'}}>
                  {stats.winRate}%
                </span>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'dashboard' && stats && simulationResults && (
          <>
            <div style={styles.chartSection}>
              <h3 style={styles.sectionTitle}>Portfolio Performance</h3>
              <div style={styles.chartContainer}>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={simulationResults}>
                    <defs>
                      <linearGradient id="gradientStrategy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4}/>
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="gradientSP500" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#059669" stopOpacity={0.4}/>
                        <stop offset="100%" stopColor="#059669" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="#1e293b" strokeWidth={1} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#64748b"
                      tick={{fill: '#94a3b8', fontSize: 11}}
                      tickFormatter={(val) => val.substring(5)}
                      interval={Math.floor(simulationResults.length / 8)}
                    />
                    <YAxis 
                      stroke="#64748b"
                      tick={{fill: '#94a3b8', fontSize: 11}}
                      tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      contentStyle={{backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '12px'}}
                      labelStyle={{color: '#e2e8f0', fontWeight: 600}}
                      formatter={(value) => `$${value.toLocaleString(undefined, {maximumFractionDigits: 0})}`}
                    />
                    <Legend />
                    <Area 
                      type="monotone"
                      dataKey="portfolioValue"
                      name="Strategy"
                      stroke="#6366f1"
                      fill="url(#gradientStrategy)"
                      strokeWidth={2}
                    />
                    <Area 
                      type="monotone"
                      dataKey="sp500Normalized"
                      name="S&P 500"
                      stroke="#059669"
                      fill="url(#gradientSP500)"
                      strokeWidth={2}
                    />
                    {showTradeMarkers && trades.map((trade) => {
                      const buyPoint = simulationResults.find(r => r.date === trade.buyDate);
                      const sellPoint = simulationResults.find(r => r.date === trade.sellDate);
                      return buyPoint && (
                        <ReferenceDot
                          key={`buy-${trade.tradeNumber}`}
                          x={trade.buyDate}
                          y={buyPoint.portfolioValue}
                          r={5}
                          fill="#22c55e"
                          stroke="#16a34a"
                          strokeWidth={2}
                        />
                      );
                    })}
                    {showTradeMarkers && trades.map((trade) => {
                      const sellPoint = simulationResults.find(r => r.date === trade.sellDate);
                      return sellPoint && (
                        <ReferenceDot
                          key={`sell-${trade.tradeNumber}`}
                          x={trade.sellDate}
                          y={sellPoint.portfolioValue}
                          r={5}
                          fill="#ef4444"
                          stroke="#dc2626"
                          strokeWidth={2}
                        />
                      );
                    })}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={styles.tradesSection}>
              <h3 style={styles.sectionTitle}>Trade History</h3>
              <div style={styles.tradesTableContainer}>
                <table style={styles.tradesTable}>
                  <thead>
                    <tr>
                      <th style={styles.tradesTh}>#</th>
                      <th style={styles.tradesTh}>Ticker</th>
                      <th style={styles.tradesTh}>Buy</th>
                      <th style={styles.tradesTh}>Sell</th>
                      <th style={styles.tradesTh}>Return</th>
                      <th style={styles.tradesTh}>Market</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.slice().reverse().slice(0, 50).map((trade) => (
                      <tr key={trade.tradeNumber}>
                        <td style={styles.tradesTd}>{trade.tradeNumber}</td>
                        <td style={styles.tradesTickerCell}>{trade.ticker}</td>
                        <td style={styles.tradesTd}>
                          <div style={styles.tradeDate}>{formatDate(trade.buyDate)}</div>
                          <div style={styles.tradePrice}>${trade.buyPrice.toFixed(2)}</div>
                        </td>
                        <td style={styles.tradesTd}>
                          <div style={styles.tradeDate}>{formatDate(trade.sellDate)}</div>
                          <div style={styles.tradePrice}>${trade.sellPrice.toFixed(2)}</div>
                        </td>
                        <td style={{...styles.tradesTd, color: trade.profit >= 0 ? '#22c55e' : '#ef4444'}}>
                          {trade.profit >= 0 ? '+' : ''}{trade.profit.toFixed(2)}%
                        </td>
                        <td style={{...styles.tradesTd, color: trade.sp500Return >= 0 ? '#22c55e' : '#ef4444'}}>
                          {trade.sp500Return >= 0 ? '+' : ''}{trade.sp500Return.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {trades.length > 50 && (
                  <p style={styles.tradesNote}>Showing most recent 50 of {trades.length} trades</p>
                )}
              </div>
            </div>
          </>
        )}

        {viewMode === 'rankings' && simulationResults && selectedDate && (
          <RankingsCard stockData={stockData} date={selectedDate} />
        )}
      </main>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: '#0a0e27',
    fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#e2e8f0',
  },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    background: 'rgba(10, 10, 10, 0.95)',
    borderBottom: '1px solid #1e293b',
    backdropFilter: 'blur(20px)',
  },
  navLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  navLogoIcon: {
    fontSize: '1.5rem',
  },
  navLogoText: {
    fontSize: '1.25rem',
    fontWeight: 700,
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  navControls: {
    display: 'flex',
    gap: '0.5rem',
  },
  navButton: {
    padding: '0.625rem 1.25rem',
    borderRadius: '8px',
    border: '1px solid #1e293b',
    background: 'transparent',
    color: '#94a3b8',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ':hover': {
      background: '#1e293b',
      color: '#e2e8f0',
    },
  },
  navButtonActive: {
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    borderColor: 'transparent',
    color: '#fff',
  },
  main: {
    maxWidth: '1600px',
    margin: '0 auto',
    padding: '2rem',
  },
  errorBanner: {
    padding: '1rem',
    marginBottom: '2rem',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid #ef4444',
    borderRadius: '8px',
    color: '#fca5a5',
    fontSize: '0.9375rem',
  },
  configSection: {
    background: 'rgba(16, 185, 129, 0.5)',
    borderRadius: '16px',
    padding: '1.5rem',
    marginBottom: '2rem',
    border: '1px solid #1e293b',
  },
  configHeader: {
    marginBottom: '1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  configTitle: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#e2e8f0',
  },
  configSubtitle: {
    fontSize: '0.875rem',
    color: '#94a3b8',
    background: 'rgba(16, 185, 129, 0.5)',
    padding: '0.25rem 0.75rem',
    borderRadius: '6px',
  },
  configGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem',
  },
  configCard: {
    background: 'rgba(10, 10, 10, 0.5)',
    borderRadius: '12px',
    padding: '1.25rem',
    border: '1px solid #1e293b',
  },
  configLabel: {
    display: 'block',
    fontSize: '0.8125rem',
    fontWeight: 600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.75rem',
  },
  yearsSelector: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  yearButton: {
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    border: '1px solid #1e293b',
    background: 'transparent',
    color: '#94a3b8',
    fontSize: '0.8125rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ':hover': {
      background: '#1e293b',
      color: '#e2e8f0',
    },
  },
  yearButtonActive: {
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    borderColor: 'transparent',
    color: '#fff',
  },
  strategyToggle: {
    display: 'flex',
    gap: '0.5rem',
  },
  strategyButton: {
    flex: 1,
    padding: '0.625rem 1rem',
    borderRadius: '6px',
    border: '1px solid #1e293b',
    background: 'transparent',
    color: '#94a3b8',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ':hover': {
      background: '#1e293b',
      color: '#e2e8f0',
    },
  },
  strategyButtonActive: {
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    borderColor: 'transparent',
    color: '#fff',
  },
  rangeContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  range: {
    flex: 1,
    height: '4px',
    borderRadius: '2px',
    background: '#1e293b',
    appearance: 'none',
    cursor: 'pointer',
  },
  rangeValue: {
    minWidth: '48px',
    textAlign: 'center',
    fontWeight: 600,
    color: '#e2e8f0',
    background: 'rgba(16, 185, 129, 0.5)',
    padding: '0.25rem 0.75rem',
    borderRadius: '6px',
    minWidth: '40px',
  },
  rangeArrow: {
    color: '#94a3b8',
    fontSize: '1rem',
    margin: '0 0.5rem',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    cursor: 'pointer',
    fontSize: '0.9375rem',
    color: '#e2e8f0',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    accentColor: '#6366f1',
    cursor: 'pointer',
  },
  statsSection: {
    background: 'rgba(16, 185, 129, 0.3)',
    borderRadius: '16px',
    padding: '1.5rem',
    marginBottom: '2rem',
    border: '1px solid #1e293b',
  },
  sectionTitle: {
    margin: '0 0 1.5rem 0',
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#e2e8f0',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '1rem',
  },
  statCard: {
    background: 'rgba(10, 10, 10, 0.5)',
    borderRadius: '12px',
    padding: '1.25rem',
    border: '1px solid #1e293b',
  },
  statLabel: {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.5rem',
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#e2e8f0',
  },
  chartSection: {
    background: 'rgba(16, 185, 129, 0.3)',
    borderRadius: '16px',
    padding: '1.5rem',
    marginBottom: '2rem',
    border: '1px solid #1e293b',
  },
  chartContainer: {
    width: '100%',
  },
  tradesSection: {
    background: 'rgba(16, 185, 129, 0.3)',
    borderRadius: '16px',
    padding: '1.5rem',
    border: '1px solid #1e293b',
  },
  tradesTableContainer: {
    overflowX: 'auto',
  },
  tradesTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.875rem',
  },
  tradesTh: {
    padding: '0.75rem',
    textAlign: 'left',
    color: '#94a3b8',
    borderBottom: '1px solid #1e293b',
    fontWeight: 600,
    textTransform: 'uppercase',
    fontSize: '0.75rem',
    letterSpacing: '0.05em',
  },
  tradesTd: {
    padding: '0.75rem',
    color: '#e2e8f0',
    borderBottom: '1px solid #1e293b',
  },
  tradesTickerCell: {
    padding: '0.75rem',
    color: '#6366f1',
    fontWeight: 600',
    borderBottom: '1px solid #1e293b',
  },
  tradeDate: {
    fontSize: '0.8125rem',
    color: '#94a3b8',
    marginBottom: '0.25rem',
  },
  tradePrice: {
    fontSize: '0.9375rem',
    fontWeight: 600',
    color: '#e2e8f0',
  },
  tradesNote: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '0.8125rem',
    marginTop: '1rem',
    fontStyle: 'italic',
  },
  rankingsCard: {
    background: 'rgba(16, 185, 129, 0.3)',
    borderRadius: '16px',
    padding: '1.5rem',
    border: '1px solid #1e293b',
  },
  rankingsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  rankingsTitle: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#e2e8f0',
  },
  rankingsDate: {
    background: 'rgba(16, 185, 129, 0.5)',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    fontSize: '0.875rem',
    color: '#94a3b8',
  },
  rankingsNav: {
    display: 'flex',
    gap: '0.5rem',
  },
  rankingsNavButton: {
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    border: '1px solid #1e293b',
    background: 'transparent',
    color: '#94a3b8',
    fontSize: '0.8125rem',
    fontWeight: 500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ':hover': {
      background: '#1e293b',
      color: '#e2e8f0',
    },
    ':disabled': {
      opacity: 0.3,
      cursor: 'not-allowed',
    },
  },
  rankingsTableContainer: {
    overflowX: 'auto',
  },
  rankingsTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.875rem',
  },
  rankingsTh: {
    padding: '0.75rem',
    textAlign: 'left',
    color: '#94a3b8',
    borderBottom: '1px solid #1e293b',
    fontWeight: 600,
    textTransform: 'uppercase',
    fontSize: '0.75rem',
    letterSpacing: '0.05em',
  },
  rankingsTd: {
    padding: '0.75rem',
    color: '#e2e8f0',
    borderBottom: '1px solid #1e293b',
  },
  rankingsTickerCell: {
    padding: '0.75rem',
    color: '#6366f1',
    fontWeight: 600',
    borderBottom: '1px solid #1e293b',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#0a0e27',
  },
  loader: {
    width: '48px',
    height: '48px',
    border: '3px solid #1e293b',
    borderTop: '3px solid #6366f1',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '1.5rem',
    color: '#94a3b8',
    fontSize: '1rem',
  },
};

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  input[type="range"]::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  input[type="range"]::-webkit-slider-thumb:hover {
    transform: scale(1.1);
  }
  input[type="range"]::-webkit-slider-thumb:active {
    transform: scale(1.05);
  }
`;
document.head.appendChild(styleSheet);

export default App;
