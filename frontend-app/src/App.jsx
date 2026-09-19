import { useState, useEffect } from "react";
import { getContract } from "./contract";
import "./App.css";

function App() {
  const [account, setAccount] = useState(null);
  const [currentRole, setCurrentRole] = useState("Manufacturer");
  const [activeTab, setActiveTab] = useState("create");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Create Batch
  const [batchId, setBatchId] = useState("");
  const [productName, setProductName] = useState("");
  const [mfgDate, setMfgDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  // Transfer
  const [transferBatchId, setTransferBatchId] = useState("");
  const [transferTo, setTransferTo] = useState("");
  const [transferRole, setTransferRole] = useState("Distributor");

  // Report Problem
  const [problemBatchId, setProblemBatchId] = useState("");
  const [problemText, setProblemText] = useState("");

  // Recall
  const [recallBatchId, setRecallBatchId] = useState("");
  const [recallReason, setRecallReason] = useState("");

  // Track
  const [trackId, setTrackId] = useState("");
  const [batchDetails, setBatchDetails] = useState(null);
  const [problemReport, setProblemReport] = useState(null);

  useEffect(() => {
    if (currentRole === "Manufacturer") setTransferRole("Distributor");
    if (currentRole === "Distributor") setTransferRole("Retailer");
  }, [currentRole]);

  async function withLoading(fn) {
    setLoading(true);
    setMessage("");
    try {
      await fn();
    } catch (error) {
      console.log(error);
      setMessage(error.reason || error.shortMessage || error.message);
    } finally {
      setLoading(false);
    }
  }

  async function connectWallet() {
    withLoading(async () => {
      const contract = await getContract();
      const signerAddress = await contract.runner.getAddress();
      setAccount(signerAddress);
      setMessage("Wallet connected.");
    });
  }

  async function createBatch() {
    withLoading(async () => {
      const contract = await getContract();
      const tx = await contract.createBatch(batchId, productName, mfgDate, expiryDate);
      await tx.wait();
      setMessage("Batch created on-chain.");
      setBatchId(""); setProductName(""); setMfgDate(""); setExpiryDate("");
    });
  }

  async function transferBatch() {
    withLoading(async () => {
      const contract = await getContract();
      const tx = await contract.transferBatch(transferBatchId, transferTo, transferRole);
      await tx.wait();
      setMessage(`Batch transferred to ${transferRole}.`);
      setTransferBatchId(""); setTransferTo("");
    });
  }

  async function reportProblem() {
    withLoading(async () => {
      const contract = await getContract();
      const tx = await contract.reportProblem(problemBatchId, problemText);
      await tx.wait();
      setMessage("Problem reported on-chain.");
      setProblemBatchId(""); setProblemText("");
    });
  }

  async function recallBatch() {
    withLoading(async () => {
      const contract = await getContract();
      const tx = await contract.recallBatch(recallBatchId, recallReason);
      await tx.wait();
      setMessage("Batch recalled.");
      setRecallBatchId(""); setRecallReason("");
    });
  }

  async function trackBatch() {
    withLoading(async () => {
      const contract = await getContract();
      const batch = await contract.getBatch(trackId);
      setBatchDetails(batch);

      try {
        const report = await contract.getProblemReport(trackId);
        setProblemReport(report[3] ? report : null);
      } catch {
        setProblemReport(null);
      }

      setMessage("Batch record retrieved.");
    });
  }

  function shortAddr(addr) {
    if (!addr || addr === "0x0000000000000000000000000000000000000000") return "—";
    return addr.slice(0, 6) + "..." + addr.slice(-4);
  }

  function formatTimestamp(ts) {
    const n = Number(ts);
    if (!n) return "—";
    return new Date(n * 1000).toLocaleString();
  }

  const tabs = [
    { id: "create", label: "Create Batch" },
    { id: "transfer", label: "Transfer" },
    { id: "problem", label: "Report Problem" },
    { id: "recall", label: "Recall" },
    { id: "track", label: "Track Batch" },
  ];

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">MS</span>
          <div>
            <h1>MedSafe</h1>
            <p className="tagline">Medicine chain-of-custody and recall system</p>
          </div>
        </div>

        <div className="wallet-box">
          {!account ? (
            <button className="btn-primary" onClick={connectWallet} disabled={loading}>
              {loading ? "Connecting…" : "Connect Wallet"}
            </button>
          ) : (
            <div className="wallet-info">
              <span className="mono">{shortAddr(account)}</span>
              <select
                className="role-select"
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value)}
              >
                <option value="Manufacturer">🏭 Manufacturer</option>
                <option value="Distributor">🚚 Distributor</option>
                <option value="Retailer">🏪 Retailer</option>
              </select>
            </div>
          )}
        </div>
      </header>

      {account && (
        <div className="role-banner">
          Connected as <b>{currentRole}</b> — {shortAddr(account)}
        </div>
      )}

      {!account && (
        <div className="empty-state">
          <p>Connect your wallet to use MedSafe.</p>
        </div>
      )}

      {account && (
        <div className="layout">
          <nav className="tabs">
            {tabs.map((t) => (
              <button
                key={t.id}
                className={activeTab === t.id ? "tab active" : "tab"}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </nav>

          <main className="panel">
            {activeTab === "create" && (
              <section>
                <h2>Create a Batch</h2>
                <p className="section-sub">Registers a new batch. Your connected address becomes the manufacturer.</p>
                <div className="field-grid">
                  <label>Batch ID
                    <input placeholder="102" value={batchId} onChange={(e) => setBatchId(e.target.value)} />
                  </label>
                  <label>Product Name
                    <input placeholder="Paracetamol" value={productName} onChange={(e) => setProductName(e.target.value)} />
                  </label>
                  <label>Manufacturing Date
                    <input placeholder="DD-MM-YYYY" value={mfgDate} onChange={(e) => setMfgDate(e.target.value)} />
                  </label>
                  <label>Expiry Date
                    <input placeholder="DD-MM-YYYY" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
                  </label>
                </div>
                <button className="btn-primary" onClick={createBatch} disabled={loading}>
                  {loading ? "Creating…" : "Create Batch"}
                </button>
              </section>
            )}

            {activeTab === "transfer" && (
              <section>
                <h2>Transfer Batch</h2>
                <p className="section-sub">Only the current owner of a batch can transfer it. Choose the role the receiving address plays.</p>
                <div className="field-grid">
                  <label>Batch ID
                    <input placeholder="102" value={transferBatchId} onChange={(e) => setTransferBatchId(e.target.value)} />
                  </label>
                  <label>Transfer To (Address)
                    <input placeholder="0x..." value={transferTo} onChange={(e) => setTransferTo(e.target.value)} />
                  </label>
                  <label>Recipient Role
                    <select value={transferRole} onChange={(e) => setTransferRole(e.target.value)}>
                      <option value="Distributor">Distributor</option>
                      <option value="Retailer">Retailer</option>
                    </select>
                  </label>
                </div>
                <button className="btn-primary" onClick={transferBatch} disabled={loading}>
                  {loading ? "Transferring…" : "Transfer Batch"}
                </button>
              </section>
            )}

            {activeTab === "problem" && (
              <section>
                <h2>Report a Problem</h2>
                <p className="section-sub">Records an issue with a batch on-chain. Batch must not already be recalled.</p>
                <div className="field-grid">
                  <label>Batch ID
                    <input placeholder="102" value={problemBatchId} onChange={(e) => setProblemBatchId(e.target.value)} />
                  </label>
                  <label>Problem Description
                    <input placeholder="Packaging damaged in transit" value={problemText} onChange={(e) => setProblemText(e.target.value)} />
                  </label>
                </div>
                <button className="btn-danger" onClick={reportProblem} disabled={loading}>
                  {loading ? "Reporting…" : "Report Problem"}
                </button>
              </section>
            )}

            {activeTab === "recall" && (
              <section>
                <h2>Recall Batch</h2>
                <p className="section-sub">Only the manufacturer of a batch can recall it.</p>
                <div className="field-grid">
                  <label>Batch ID
                    <input placeholder="102" value={recallBatchId} onChange={(e) => setRecallBatchId(e.target.value)} />
                  </label>
                  <label>Reason
                    <input placeholder="Quality issue detected" value={recallReason} onChange={(e) => setRecallReason(e.target.value)} />
                  </label>
                </div>
                <button className="btn-danger" onClick={recallBatch} disabled={loading}>
                  {loading ? "Recalling…" : "Recall Batch"}
                </button>
              </section>
            )}

            {activeTab === "track" && (
              <section>
                <h2>Track a Batch</h2>
                <p className="section-sub">Enter a Batch ID to see its full record and history.</p>
                <div className="field-grid">
                  <label>Batch ID
                    <input placeholder="102" value={trackId} onChange={(e) => setTrackId(e.target.value)} />
                  </label>
                </div>
                <button className="btn-secondary" onClick={trackBatch} disabled={loading}>
                  {loading ? "Searching…" : "Track Batch"}
                </button>

                {batchDetails && (
                  <div className="track-result">
                    <div className={batchDetails[8] ? "stamp stamp-recalled" : "stamp stamp-safe"}>
                      {batchDetails[8] ? "RECALLED" : "SAFE"}
                    </div>

                    <dl>
                      <dt>Batch ID</dt><dd className="mono">{batchDetails[0]}</dd>
                      <dt>Product</dt><dd>{batchDetails[1]}</dd>
                      <dt>Manufacturer</dt><dd className="mono">{shortAddr(batchDetails[2])}</dd>
                      <dt>Distributor</dt><dd className="mono">{shortAddr(batchDetails[3])}</dd>
                      <dt>Retailer</dt><dd className="mono">{shortAddr(batchDetails[4])}</dd>
                      <dt>Mfg Date</dt><dd>{batchDetails[5]}</dd>
                      <dt>Expiry Date</dt><dd>{batchDetails[6]}</dd>
                      <dt>Current Owner</dt><dd className="mono">{shortAddr(batchDetails[7])}</dd>
                      <dt>Recall Reason</dt><dd>{batchDetails[9] || "—"}</dd>
                    </dl>

                    {problemReport && (
                      <div className="alert-banner">
                        ⚠️ Problem reported by {shortAddr(problemReport[0])}: "{problemReport[1]}" on {formatTimestamp(problemReport[2])}
                      </div>
                    )}

                    <h3 className="timeline-title">Transfer History</h3>
                    <div className="timeline">
                      {batchDetails[10].map((entry, i) => (
                        <div className="timeline-step" key={i}>
                          <span className={entry.toLowerCase().includes("recalled") ? "dot dot-recalled" : "dot"} />
                          <p className="timeline-label">{entry}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {message && <p className="message">{message}</p>}
          </main>
        </div>
      )}
    </div>
  );
}

export default App;