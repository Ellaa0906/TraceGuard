import React, { useEffect, useState } from 'react';
import { resolveHolderRole, formatAddress } from '../utils/roleHelper';

export default function BatchDetails({ contract, batchId }) {
  const [batch, setBatch] = useState(null);
  const [problemReport, setProblemReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetails() {
      if (!contract || !batchId) return;
      try {
        const batchInfo = await contract.getBatch(batchId);
        setBatch(batchInfo);

        try {
          const report = await contract.getProblemReport(batchId);
          if (report && report.exists) {
            setProblemReport(report);
          }
        } catch (e) {
          // No problem report found
        }
      } catch (err) {
        console.error("Error fetching batch details:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [contract, batchId]);

  if (loading) return <div>Loading batch details from blockchain...</div>;
  if (!batch) return <div>Batch not found.</div>;

  const currentRole = resolveHolderRole(batch.currentOwner, batch);

  return (
    <div className="batch-details-container">
      <h2>Batch Details & Traceability</h2>

      {/* Status & Current Holder Highlights */}
      <div className="highlight-banner" style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div className="card" style={{ flex: 1 }}>
          <h4>📍 CURRENT HOLDER</h4>
          <h3 style={{ color: '#007bff' }}>{currentRole}</h3>
          <p>{batch.currentOwner}</p>
        </div>

        <div className="card" style={{ flex: 1 }}>
          <h4>📊 BATCH STATUS</h4>
          <h3>
            {batch.isRecalled ? '🔴 RECALLED' : problemReport ? '🟠 PROBLEM REPORTED' : '🟢 SAFE'}
          </h3>
          <p>{batch.isRecalled ? batch.recallReason : problemReport ? problemReport.problem : 'No issues flagged'}</p>
        </div>
      </div>

      {/* Core Batch Info */}
      <div className="card">
        <h3>Batch Information</h3>
        <p><strong>Batch ID:</strong> {batch.batchId}</p>
        <p><strong>Product Name:</strong> {batch.productName}</p>
        <p><strong>Manufacturing Date:</strong> {batch.mfgDate}</p>
        <p><strong>Expiry Date:</strong> {batch.expiryDate}</p>
      </div>

      {/* Problem Report Details Section if available */}
      {problemReport && problemReport.exists && (
        <div className="card alert-card" style={{ borderLeft: '5px solid orange', background: '#fffcf5' }}>
          <h3>🚨 Active Problem Report</h3>
          <p><strong>Reported By:</strong> {formatAddress(problemReport.reportedBy)} (Retailer Node)</p>
          <p><strong>Problem Description:</strong> {problemReport.problem}</p>
          <p><strong>Timestamp:</strong> {new Date(Number(problemReport.timestamp) * 1000).toLocaleString()}</p>
          <p style={{ fontSize: '0.9em', color: '#666' }}>✅ Manufacturer & Distributor nodes have been automatically notified via blockchain event logs.</p>
        </div>
      )}

      {/* Visual Tracking & Chain of Custody */}
      <div className="card">
        <h3>Chain of Custody & Movement History</h3>
        <ul className="timeline">
          {batch.transferHistory.map((step, index) => (
            <li key={index} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
              ✓ {step}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}