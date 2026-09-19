import React, { useState } from 'react';
import { resolveHolderRole, formatAddress } from '../utils/roleHelper';

export default function RetailerDashboard({ contract, account, refreshData }) {
  const [searchId, setSearchId] = useState('');
  const [batchData, setBatchData] = useState(null);
  const [problemDesc, setProblemDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search batch to verify ownership before reporting
  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setBatchData(null);
    try {
      const data = await contract.getBatch(searchId);
      setBatchData(data);
    } catch (err) {
      setError('Batch not found or contract error.');
    }
  };

  // Submit problem report to blockchain
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!batchData) return;
    
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const tx = await contract.reportProblem(searchId, problemDesc);
      await tx.wait();
      setSuccessMsg('🚨 Problem successfully reported to the blockchain network!');
      setProblemDesc('');
      // Reload batch details to reflect status update
      const updatedData = await contract.getBatch(searchId);
      setBatchData(updatedData);
    } catch (err) {
      setError('Transaction failed: ' + (err.reason || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard retailer-dashboard">
      <h2>Retailer Dashboard</h2>
      <p>Connected Account: <strong>{formatAddress(account)}</strong></p>

      <div className="card">
        <h3>Track & Report Batch Issues</h3>
        <form onSubmit={handleSearch} className="search-form">
          <input 
            type="text" 
            placeholder="Enter Batch ID (e.g. 102)" 
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            required
          />
          <button type="submit">Lookup Batch</button>
        </form>

        {error && <p className="error-text">{error}</p>}
        {successMsg && <p className="success-text">{successMsg}</p>}

        {batchData && (
          <div className="batch-result-card">
            <h4>Product: {batchData.productName} (ID: {batchData.batchId})</h4>
            <p><strong>Current Holder:</strong> {resolveHolderRole(batchData.currentOwner, batchData)} ({formatAddress(batchData.currentOwner)})</p>
            <p><strong>Status:</strong> {batchData.isRecalled ? "🔴 RECALLED" : "🟢 SAFE / ACTIVE"}</p>

            {/* Report Problem Form */}
            <div className="report-box" style={{ marginTop: '20px', padding: '15px', background: '#fff3cd', borderRadius: '6px' }}>
              <h4>🚨 Report a Problem with this Batch</h4>
              <form onSubmit={handleReportSubmit}>
                <textarea 
                  rows="3"
                  placeholder="Describe the issue (e.g., Damaged packaging, temperature excursion...)" 
                  value={problemDesc}
                  onChange={(e) => setProblemDesc(e.target.value)}
                  required
                  style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
                />
                <button type="submit" disabled={loading} className="btn-warning">
                  {loading ? 'Submitting to Blockchain...' : 'Report Problem'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}