import React, { useState } from 'react';
import { Search, TrendingUp, DollarSign, Users, Zap, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export default function NicheVerifier() {
  const [niche, setNiche] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tier, setTier] = useState('ai'); // 'ai' or 'quality'

  const [channelData, setChannelData] = useState({
    maxSubs: '',
    channelAge: '',
    videoCount: '',
    totalChannels: '',
    nichePoolVideos: '',
    monthlyViews: '',
    newChannelsGettingViews: ''
  });

  // Analyze based on selected tier
  const analyzeNiche = (nicheText, data, selectedTier) => {
    setLoading(true);
    
    setTimeout(() => {
      const analysis = {
        niche: nicheText,
        tier: selectedTier,
        criteria: selectedTier === 'ai' 
          ? getAICriteria(data) 
          : getQualityCriteria(data)
      };
      
      // Calculate pass/fail for each criterion
      const passedCriteria = Object.values(analysis.criteria).filter(c => c.passed).length;
      const totalCriteria = Object.values(analysis.criteria).length;
      const passRate = (passedCriteria / totalCriteria) * 100;
      
      analysis.overall = passRate;
      analysis.passedCount = passedCriteria;
      analysis.totalCount = totalCriteria;
      analysis.verdict = getVerdict(passRate, passedCriteria, selectedTier);
      
      setResults(analysis);
      setLoading(false);
    }, 1000);
  };

  // AI CHANNELS CRITERIA
  const getAICriteria = (data) => {
    return {
      channelSize: checkAIChannelSize(data.maxSubs),
      channelAge: checkAIChannelAge(data.channelAge),
      viewThreshold: checkViewThreshold(data.monthlyViews),
      competitionCount: checkCompetitionCount(data.totalChannels),
      nichePoolSize: checkNichePoolSize(data.nichePoolVideos),
      newChannelsViews: checkNewChannels(data.newChannelsGettingViews)
    };
  };

  // QUALITY CONTENT CRITERIA
  const getQualityCriteria = (data) => {
    return {
      channelAge: checkQualityChannelAge(data.channelAge),
      videoCount: checkQualityVideoCount(data.videoCount),
      oversaturation: checkQualityOversaturation(data.totalChannels, data.nichePoolVideos)
    };
  };

  // === AI TIER CHECKS ===

  const checkAIChannelSize = (maxSubs) => {
    const subs = parseInt(maxSubs) || 0;
    
    if (subs <= 10000) {
      return { 
        passed: true, 
        score: 100, 
        message: "✓ Excellent - Under 10K subs (AI tier ideal)"
      };
    } else if (subs <= 20000) {
      return { 
        passed: true, 
        score: 85, 
        message: "✓ Good - Under 20K subs (AI tier acceptable)"
      };
    } else {
      return { 
        passed: false, 
        score: 20, 
        message: "✗ Too competitive - Channels over 20K subs"
      };
    }
  };

  const checkAIChannelAge = (age) => {
    const ageMonths = parseFloat(age) || 0;
    
    if (ageMonths <= 0.25) { // 1 week
      return { 
        passed: true, 
        score: 100, 
        message: "✓ S+ Tier - 1 week old channel getting views!"
      };
    } else if (ageMonths <= 1) {
      return { 
        passed: true, 
        score: 90, 
        message: "✓ Great - 1 month old"
      };
    } else if (ageMonths <= 3) {
      return { 
        passed: true, 
        score: 75, 
        message: "✓ Average - 3 months old (acceptable)"
      };
    } else {
      return { 
        passed: false, 
        score: 30, 
        message: "✗ Too old - Need channels under 3 months"
      };
    }
  };

  // === QUALITY CONTENT TIER CHECKS ===

  const checkQualityChannelAge = (age) => {
    const ageMonths = parseFloat(age) || 0;
    
    if (ageMonths < 6) {
      return { 
        passed: true, 
        score: 100, 
        message: "✓ Perfect - Less than 6 months old (Ideal: 1 week old)"
      };
    } else {
      return { 
        passed: false, 
        score: 20, 
        message: "✗ Established/Closed Niche - Over 6 months old"
      };
    }
  };

  const checkQualityVideoCount = (count) => {
    const videos = parseInt(count) || 0;
    
    if (videos <= 15) {
      return { 
        passed: true, 
        score: 100, 
        message: "✓ Excellent - 15 videos or less per channel"
      };
    } else {
      return { 
        passed: false, 
        score: 30, 
        message: "✗ Too many videos - Must be 15 or less"
      };
    }
  };

  const checkQualityOversaturation = (channels, poolVideos) => {
    const totalChannels = parseInt(channels) || 0;
    const videos = parseInt(poolVideos) || 0;
    
    const channelsPassed = totalChannels <= 5;
    const videosPassed = videos < 50;
    
    if (channelsPassed && videosPassed) {
      return {
        passed: true,
        score: 100,
        message: `✓ Perfect - ${totalChannels} channels & ${videos} videos in niche pool`
      };
    } else if (channelsPassed) {
      return {
        passed: false,
        score: 50,
        message: `⚠ Too many videos - ${videos} videos (need <50)`
      };
    } else if (videosPassed) {
      return {
        passed: false,
        score: 50,
        message: `⚠ Too many channels - ${totalChannels} channels (need ≤5)`
      };
    } else {
      return {
        passed: false,
        score: 20,
        message: `✗ Oversaturated - ${totalChannels} channels & ${videos} videos`
      };
    }
  };

  // === SHARED CRITERIA (AI TIER) ===

  const checkViewThreshold = (views) => {
    const monthlyViews = parseInt(views) || 0;
    
    if (monthlyViews >= 100000) {
      return { 
        passed: true, 
        score: 100, 
        message: `✓ Excellent - ${(monthlyViews/1000).toFixed(0)}K+ views/month`
      };
    } else if (monthlyViews >= 50000) {
      return { 
        passed: false, 
        score: 60, 
        message: "⚠ Borderline - Under 100K views/month threshold"
      };
    } else {
      return { 
        passed: false, 
        score: 20, 
        message: "✗ Too low - Must get 100K+ views/month"
      };
    }
  };

  const checkCompetitionCount = (count) => {
    const competitors = parseInt(count) || 0;
    
    if (competitors <= 3) {
      return { 
        passed: true, 
        score: 100, 
        message: "✓ Ideal - 2-3 competitors only!"
      };
    } else if (competitors <= 10) {
      return { 
        passed: true, 
        score: 80, 
        message: "✓ Good - Under 10 competitors"
      };
    } else {
      return { 
        passed: false, 
        score: 30, 
        message: "✗ Too crowded - More than 10 competitors"
      };
    }
  };

  const checkNichePoolSize = (videos) => {
    const totalVideos = parseInt(videos) || 0;
    
    if (totalVideos <= 30) {
      return { 
        passed: true, 
        score: 100, 
        message: "✓ Optimal - 30 videos or less"
      };
    } else if (totalVideos <= 300) {
      return { 
        passed: true, 
        score: 90, 
        message: "✓ Excellent - Under 300 videos"
      };
    } else if (totalVideos <= 500) {
      return { 
        passed: true, 
        score: 75, 
        message: "✓ Good - Under 500 videos"
      };
    } else if (totalVideos <= 1000) {
      return { 
        passed: true, 
        score: 60, 
        message: "⚠ Workable - Under 1000 videos (max limit)"
      };
    } else {
      return { 
        passed: false, 
        score: 20, 
        message: "✗ Oversaturated - More than 1000 videos"
      };
    }
  };

  const checkNewChannels = (count) => {
    const newChannels = parseInt(count) || 0;
    
    if (newChannels >= 3) {
      return { 
        passed: true, 
        score: 100, 
        message: "✓ Excellent - 3+ new channels getting 100K+ views"
      };
    } else if (newChannels >= 1) {
      return { 
        passed: false, 
        score: 50, 
        message: "⚠ Risky - Only 1-2 new channels succeeding"
      };
    } else {
      return { 
        passed: false, 
        score: 10, 
        message: "✗ Dead niche - No new channels getting views"
      };
    }
  };

  const getVerdict = (passRate, passedCount, selectedTier) => {
    if (selectedTier === 'quality') {
      // Quality tier has only 3 criteria
      if (passedCount === 3) {
        return { text: 'KILLER NICHE ✓', status: 'success' };
      } else if (passedCount === 2) {
        return { text: 'RISKY - CAREFUL', status: 'warning' };
      }
      return { text: 'AVOID THIS NICHE', status: 'danger' };
    } else {
      // AI tier has 6 criteria
      if (passedCount >= 5) {
        return { text: 'KILLER NICHE ✓', status: 'success' };
      } else if (passedCount >= 4) {
        return { text: 'GOOD POTENTIAL', status: 'good' };
      } else if (passedCount >= 3) {
        return { text: 'RISKY - CAREFUL', status: 'warning' };
      }
      return { text: 'AVOID THIS NICHE', status: 'danger' };
    }
  };

  const CriteriaItem = ({ label, criterion, icon: Icon }) => {
    return (
      <div className="criteria-item">
        <div className="criteria-header">
          <div className="criteria-label">
            <Icon size={18} />
            <span>{label}</span>
          </div>
          <div className={`criteria-badge ${criterion.passed ? 'passed' : 'failed'}`}>
            {criterion.passed ? '✓ PASSED' : '✗ FAILED'}
          </div>
        </div>
        <div className="criteria-score">Score: {criterion.score}/100</div>
        <div className="criteria-message">{criterion.message}</div>
      </div>
    );
  };

  return (
    <div className="container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Poppins:wght@700;800&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', sans-serif;
          background: linear-gradient(135deg, #fff5eb 0%, #ffffff 50%, #fff0e0 100%);
          color: #1a1a1a;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .container {
          max-width: 900px;
          margin: 0 auto;
          padding: 60px 30px;
          position: relative;
        }

        .container::before {
          content: '';
          position: fixed;
          top: -20%;
          right: -20%;
          width: 60%;
          height: 60%;
          background: radial-gradient(circle, rgba(255,140,0,0.15) 0%, transparent 70%);
          animation: pulse 8s ease-in-out infinite;
          pointer-events: none;
          border-radius: 50%;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }

        .header {
          text-align: center;
          margin-bottom: 60px;
          position: relative;
          z-index: 1;
        }

        .title {
          font-family: 'Poppins', sans-serif;
          font-size: 4rem;
          font-weight: 800;
          background: linear-gradient(135deg, #ff8c00 0%, #ff6600 50%, #ff8c00 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
          letter-spacing: -2px;
          text-transform: uppercase;
          margin-bottom: 15px;
          filter: drop-shadow(0 4px 20px rgba(255,140,0,0.3));
        }

        @keyframes shimmer {
          to { background-position: 200% center; }
        }

        .subtitle {
          font-size: 0.95rem;
          color: #666;
          letter-spacing: 3px;
          text-transform: uppercase;
          font-weight: 600;
        }

        .input-section {
          background: #ffffff;
          border: 2px solid #ff8c00;
          border-radius: 24px;
          padding: 40px;
          margin-bottom: 40px;
          box-shadow: 0 10px 40px rgba(255,140,0,0.15);
          position: relative;
          z-index: 1;
        }

        .input-wrapper {
          position: relative;
          margin-bottom: 20px;
        }

        .input-label {
          display: block;
          font-size: 0.85rem;
          color: #ff6600;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 700;
        }

        .input-box, .select-box {
          width: 100%;
          background: #fff5eb;
          border: 2px solid #ffd4a3;
          border-radius: 12px;
          padding: 16px;
          font-family: 'Inter', sans-serif;
          font-size: 1rem;
          color: #1a1a1a;
          outline: none;
          transition: all 0.3s;
          font-weight: 500;
        }

        .select-box {
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23ff6600' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 15px center;
          background-size: 20px;
          padding-right: 50px;
        }

        .input-box:focus, .select-box:focus {
          border-color: #ff8c00;
          box-shadow: 0 0 0 4px rgba(255,140,0,0.1);
          background: #ffffff;
        }

        .data-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-top: 25px;
        }

        .tier-badge {
          display: inline-block;
          padding: 8px 16px;
          background: linear-gradient(135deg, #ff8c00, #ff6600);
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-top: 10px;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(255,140,0,0.3);
        }

        .analyze-btn {
          width: 100%;
          background: linear-gradient(135deg, #ff8c00, #ff6600);
          border: none;
          border-radius: 14px;
          padding: 18px;
          font-family: 'Poppins', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          color: #ffffff;
          cursor: pointer;
          margin-top: 25px;
          text-transform: uppercase;
          letter-spacing: 2px;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 8px 24px rgba(255,140,0,0.4);
        }

        .analyze-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(255,140,0,0.5);
        }

        .analyze-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .analyze-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .loading {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .results-container {
          animation: slideIn 0.5s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .verdict-card {
          background: #ffffff;
          border-radius: 24px;
          padding: 40px;
          margin-bottom: 30px;
          text-align: center;
          border: 3px solid;
          box-shadow: 0 10px 40px rgba(0,0,0,0.08);
        }

        .verdict-card.success {
          border-color: #10b981;
          background: linear-gradient(135deg, rgba(16,185,129,0.05), #ffffff);
        }

        .verdict-card.good {
          border-color: #3b82f6;
          background: linear-gradient(135deg, rgba(59,130,246,0.05), #ffffff);
        }

        .verdict-card.warning {
          border-color: #ff8c00;
          background: linear-gradient(135deg, rgba(255,140,0,0.05), #ffffff);
        }

        .verdict-card.danger {
          border-color: #ef4444;
          background: linear-gradient(135deg, rgba(239,68,68,0.05), #ffffff);
        }

        .verdict-icon {
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .verdict-text {
          font-family: 'Poppins', sans-serif;
          font-size: 2.2rem;
          font-weight: 800;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #1a1a1a;
        }

        .verdict-score {
          font-size: 1.1rem;
          color: #666;
          font-weight: 600;
        }

        .scores-grid {
          background: #ffffff;
          border: 2px solid #ff8c00;
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 10px 40px rgba(255,140,0,0.15);
        }

        .scores-title {
          font-family: 'Poppins', sans-serif;
          font-size: 1.4rem;
          margin-bottom: 30px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #ff6600;
          font-weight: 800;
        }

        .criteria-item {
          margin-bottom: 28px;
          background: #fff5eb;
          padding: 24px;
          border-radius: 16px;
          border-left: 5px solid #ff8c00;
          transition: all 0.3s;
        }

        .criteria-item:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 16px rgba(255,140,0,0.1);
        }

        .criteria-item:last-child {
          margin-bottom: 0;
        }

        .criteria-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .criteria-label {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 700;
          color: #1a1a1a;
        }

        .criteria-badge {
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .criteria-badge.passed {
          background: #10b981;
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(16,185,129,0.3);
        }

        .criteria-badge.failed {
          background: #ef4444;
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(239,68,68,0.3);
        }

        .criteria-score {
          font-size: 0.85rem;
          color: #666;
          margin-bottom: 8px;
          font-weight: 600;
        }

        .criteria-message {
          font-size: 0.95rem;
          color: #444;
          line-height: 1.6;
          font-weight: 500;
        }

        .niche-display {
          margin-top: 25px;
          padding: 20px;
          background: #fff5eb;
          border-left: 4px solid #ff8c00;
          border-radius: 12px;
          font-style: italic;
          color: #666;
          font-weight: 600;
        }

        @media (max-width: 600px) {
          .title {
            font-size: 2.5rem;
          }
          
          .input-section, .verdict-card, .scores-grid {
            padding: 25px;
          }

          .data-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="header">
        <h1 className="title">Niche<br/>Verifier</h1>
        <p className="subtitle">Faceless Channel Analysis</p>
      </div>

      <div className="input-section">
        <div className="input-wrapper">
          <label className="input-label">Select Channel Category</label>
          <select 
            className="select-box"
            value={tier}
            onChange={(e) => setTier(e.target.value)}
          >
            <option value="ai">AI Channels (Easy Entry)</option>
            <option value="quality">Quality Content (Intermediate)</option>
          </select>
          <span className="tier-badge">
            {tier === 'ai' ? 'AI TIER CRITERIA' : 'QUALITY TIER CRITERIA'}
          </span>
        </div>

        <div className="input-wrapper">
          <label className="input-label">Your Niche Idea</label>
          <input
            type="text"
            className="input-box"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
          />
        </div>

        <div className="data-grid">
          {tier === 'ai' ? (
            <>
              <div className="input-wrapper">
                <label className="input-label">Max Channel Subs</label>
                <input
                  type="number"
                  className="input-box"
                  value={channelData.maxSubs}
                  onChange={(e) => setChannelData({...channelData, maxSubs: e.target.value})}
                />
              </div>

              <div className="input-wrapper">
                <label className="input-label">Youngest Channel Age (months)</label>
                <input
                  type="number"
                  step="0.25"
                  className="input-box"
                  value={channelData.channelAge}
                  onChange={(e) => setChannelData({...channelData, channelAge: e.target.value})}
                />
              </div>

              <div className="input-wrapper">
                <label className="input-label">Total Competing Channels</label>
                <input
                  type="number"
                  className="input-box"
                  value={channelData.totalChannels}
                  onChange={(e) => setChannelData({...channelData, totalChannels: e.target.value})}
                />
              </div>

              <div className="input-wrapper">
                <label className="input-label">Total Videos in Niche Pool</label>
                <input
                  type="number"
                  className="input-box"
                  value={channelData.nichePoolVideos}
                  onChange={(e) => setChannelData({...channelData, nichePoolVideos: e.target.value})}
                />
              </div>

              <div className="input-wrapper">
                <label className="input-label">Monthly Views (Best Channel)</label>
                <input
                  type="number"
                  className="input-box"
                  value={channelData.monthlyViews}
                  onChange={(e) => setChannelData({...channelData, monthlyViews: e.target.value})}
                />
              </div>

              <div className="input-wrapper">
                <label className="input-label">New Channels Getting 100K+ Views</label>
                <input
                  type="number"
                  className="input-box"
                  value={channelData.newChannelsGettingViews}
                  onChange={(e) => setChannelData({...channelData, newChannelsGettingViews: e.target.value})}
                />
              </div>
            </>
          ) : (
            <>
              <div className="input-wrapper">
                <label className="input-label">Channel Age (months)</label>
                <input
                  type="number"
                  step="0.25"
                  className="input-box"
                  value={channelData.channelAge}
                  onChange={(e) => setChannelData({...channelData, channelAge: e.target.value})}
                />
              </div>

              <div className="input-wrapper">
                <label className="input-label">Video Count (per channel)</label>
                <input
                  type="number"
                  className="input-box"
                  value={channelData.videoCount}
                  onChange={(e) => setChannelData({...channelData, videoCount: e.target.value})}
                />
              </div>

              <div className="input-wrapper">
                <label className="input-label">Total Channels in Niche</label>
                <input
                  type="number"
                  className="input-box"
                  value={channelData.totalChannels}
                  onChange={(e) => setChannelData({...channelData, totalChannels: e.target.value})}
                />
              </div>

              <div className="input-wrapper">
                <label className="input-label">Total Videos in Niche Pool</label>
                <input
                  type="number"
                  className="input-box"
                  value={channelData.nichePoolVideos}
                  onChange={(e) => setChannelData({...channelData, nichePoolVideos: e.target.value})}
                />
              </div>
            </>
          )}
        </div>

        <button 
          className="analyze-btn"
          onClick={() => analyzeNiche(niche, channelData, tier)}
          disabled={!niche.trim() || loading}
        >
          {loading ? (
            <>
              <Zap className="loading" size={20} />
              Analyzing...
            </>
          ) : (
            <>
              <Search size={20} />
              Verify Niche
            </>
          )}
        </button>
      </div>

      {results && (
        <div className="results-container">
          <div className={`verdict-card ${results.verdict.status}`}>
            <div className="verdict-icon">
              {results.verdict.status === 'success' && <CheckCircle2 size={60} color="#10b981" />}
              {results.verdict.status === 'good' && <CheckCircle2 size={60} color="#3b82f6" />}
              {results.verdict.status === 'warning' && <AlertCircle size={60} color="#f59e0b" />}
              {results.verdict.status === 'danger' && <XCircle size={60} color="#ef4444" />}
            </div>
            <div className="verdict-text">{results.verdict.text}</div>
            <div className="verdict-score">
              Passed {results.passedCount}/{results.totalCount} Critical Criteria
            </div>
            <div className="niche-display">
              "{results.niche}" - {results.tier === 'ai' ? 'AI Tier' : 'Quality Tier'}
            </div>
          </div>

          <div className="scores-grid">
            <h2 className="scores-title">
              {results.tier === 'ai' ? 'AI Tier Analysis' : 'Quality Tier Analysis'}
            </h2>
            
            {results.tier === 'ai' ? (
              <>
                <CriteriaItem 
                  label="Channel Size Limit (< 20K)" 
                  criterion={results.criteria.channelSize} 
                  icon={Users}
                />
                <CriteriaItem 
                  label="Channel Age (< 3 months)" 
                  criterion={results.criteria.channelAge} 
                  icon={TrendingUp}
                />
                <CriteriaItem 
                  label="View Threshold (100K/month)" 
                  criterion={results.criteria.viewThreshold} 
                  icon={DollarSign}
                />
                <CriteriaItem 
                  label="Competition Count (≤ 10)" 
                  criterion={results.criteria.competitionCount} 
                  icon={Users}
                />
                <CriteriaItem 
                  label="Niche Pool Size (< 1000)" 
                  criterion={results.criteria.nichePoolSize} 
                  icon={Search}
                />
                <CriteriaItem 
                  label="New Channels Success (≥ 3)" 
                  criterion={results.criteria.newChannelsViews} 
                  icon={Zap}
                />
              </>
            ) : (
              <>
                <CriteriaItem 
                  label="Channel Age (< 6 months)" 
                  criterion={results.criteria.channelAge} 
                  icon={TrendingUp}
                />
                <CriteriaItem 
                  label="Video Count (≤ 15 videos)" 
                  criterion={results.criteria.videoCount} 
                  icon={Search}
                />
                <CriteriaItem 
                  label="Oversaturation Check" 
                  criterion={results.criteria.oversaturation} 
                  icon={Users}
                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
