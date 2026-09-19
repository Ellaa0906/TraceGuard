import { useState, useEffect } from "react";
import { getContract } from "./contract";
import "./App.css";

const ROLE_NAMES = ["None", "Manufacturer", "Distributor", "Retailer"];

function App() {
  const [account, setAccount] = useState(null);
  const [role, setRole] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Create Batch
  const [batchId, setBatchId] = useState("");
  const [productName, setProductName] = useState("");
  const [mfgDate, setMfgDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [distributorAddr, setDistributorAddr] = useState("");

  // Transfer
  const [transferBatchId, setTransferBatchId] = useState("");
  const [newOwner, setNewOwner] = useState("");

  // Recall
  const [recallBatchId, setRecallBatchId] = useState("");
  const [recallReason, setRecallReason] = useState("");

  // Track / Search
  const [trackId, setTrackId] = useState("");
  const [batchDetails, setBatchDetails] = useState(null);
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);

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

      const roleValue = await contract.getRole(signerAddress);
      setRole(Number(roleValue));

      setMessage("Wallet connected.");
    });
  }

  async function addBatch() {
    withLoading(async () => {
      const contract = await getContract();
      const tx = await contract.addBatch(
        batchId,
        productName,
        mfgDate,
        expiryDate,
        distributorAddr
      );
      await tx.wait();
      setMessage("Batch created and assigned to distributor.");
      setBatchId("");
      setProductName("");
      setMfgDate("");
      setExpiryDate("");
      setDistributorAddr("");
    });
  }

  async function transferOwnership() {
    withLoading(async () => {
      const contract = await getContract();
      const tx = await contract.transferOwnership(transferBatchId, newOwner);
      await tx.wait();
      setMessage("Custody transferred.");
      setTransferBatchId("");
      setNewOwner("");
    });
  }

  async function recallBatch() {
    withLoading(async () => {
      const contract = await getContract();
      const tx = await contract.recallBatch(recallBatchId, recallReason);
      await tx.wait();
      setMessage("Recall filed. All holders of this batch will see the alert.");
      setRecallBatchId("");
      setRecallReason("");
    });
  }

  async function trackBatch() {
    withLoading(async () => {
      const contract = await getContract();
      const batch = await contract.getBatchDetails(trackId);
      const statusResult = await contract.checkStatus(trackId);
      const historyResult = await contract.getTransferHistory(trackId);

      setBatchDetails(batch);
      setStatus(statusResult);
      setHistory(historyResult);
      setMessage("Batch record retrieved.");
    });
  }

  function roleLabel(r) {
    return ROLE_NAMES[r] || "Unknown";
  }

  function formatTimestamp(ts) {
    const n = Number(ts);
    if (!n) return "—";
    return new Date(n * 1000).toLocaleString();
  }

  function shortAddr(addr) {
    if (!addr || addr === "0x0000000000000000000000000000000000000000") return "—";
    return addr.slice(0, 6) + "..." + addr.slice(-4);
  }

  const tabsByRole = {
    1: [ // Manufacturer
      { id: "home", label: "Overview" },
      { id: "create", label: "Create Batch" },
      { id: "track", label: "Track Batch" },
      { id: "recall", label: "Recall" },
    ],
    2: [ // Distributor
      { id: "home", label: "Overview" },
      { id: "track", label: "Track Batch" },
      { id: "transfer", label: "Transfer to Retailer" },
    ],
    3: [ // Retailer
      { id: "home", label: "Overview" },
      { id: "track", label: "Track Batch" },
    ],
  };

  const tabs = role ? (tabsByRole[role] || tabsByRole[1]) : [{ id: "home", label: "Overview" }];

  const isRecalledAndInvolved =
    batchDetails &&
    status === "RECALLED" &&
    account &&
    [batchDetails[2], batchDetails[3], batchDetails[4], batchDetails[7]]
      .map((a) => (a || "").toLowerCase())
      .includes(account.toLowerCase());

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
              <span className={"role-pill role-" + role}>{roleLabel(role)}</span>
            </div>
          )}
        </div>
      </header>

      {!account && (
        <div className="empty-state">
          <p>Connect your wallet to see your MedSafe dashboard.</p>
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
            {activeTab === "home" && (
              <section>
                <h2>{roleLabel(role)} Dashboard</h2>
                <p className="section-sub">
                  {role === 1 && "Create batches, assign them to a distributor, and file recalls if a defect is found."}
                  {role === 2 && "Track batches assigned to you and transfer them onward to a retailer."}
                  {role === 3 && "Track batches you've received and watch for recall alerts."}
                  {!role && "Connected wallet has no assigned role yet."}
                </p>
                <p className="hint">Use the <b>Track Batch</b> tab any time to look up a Batch ID and see its full chain of custody.</p>
              </section>
            )}

            {activeTab === "create" && role === 1 && (
              <section>
                <h2>Create a Batch</h2>
                <p className="section-sub">Registers a new batch and assigns it to a distributor's wallet address.</p>
                <div className="field-grid">
                  <label>Batch ID
                    <input placeholder="MED101" value={batchId} onChange={(e) => setBatchId(e.target.value)} />
                  </label>
                  <label>Product Name
                    <input placeholder="Vaccine A" value={productName} onChange={(e) => setProductName(e.target.value)} />
                  </label>
                  <label>Manufacturing Date
                    <input placeholder="DD-MM-YYYY" value={mfgDate} onChange={(e) => setMfgDate(e.target.value)} />
                  </label>
                  <label>Expiry Date
                    <input placeholder="DD-MM-YYYY" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
                  </label>
                  <label className="span-2">Distributor Address
                    <input placeholder="0x..." value={distributorAddr} onChange={(e) => setDistributorAddr(e.target.value)} />
                  </label>
                </div>
                <button className="btn-primary" onClick={addBatch} disabled={loading}>
                  {loading ? "Creating…" : "Create Batch"}
                </button>
              </section>
            )}

            {activeTab === "transfer" && (role === 2 || role === 3) && (
              <section>
                <h2>Transfer Custody</h2>
                <p className="section-sub">Only the current holder of a batch can transfer it onward.</p>
                <div className="field-grid">
                  <label>Batch ID
                    <input placeholder="MED101" value={transferBatchId} onChange={(e) => setTransferBatchId(e.target.value)} />
                  </label>
                  <label>New Owner Address
                    <input placeholder="0x..." value={newOwner} onChange={(e) => setNewOwner(e.target.value)} />
                  </label>
                </div>
                <button className="btn-primary" onClick={transferOwnership} disabled={loading}>
                  {loading ? "Transferring…" : "Transfer"}
                </button>
              </section>
            )}

            {activeTab === "recall" && role === 1 && (
              <section>
                <h2>File a Recall</h2>
                <p className="section-sub">Only the manufacturer of a batch can recall it. All current and past holders will see the alert when they track it.</p>
                <div className="field-grid">
                  <label>Batch ID
                    <input placeholder="MED101" value={recallBatchId} onChange={(e) => setRecallBatchId(e.target.value)} />
                  </label>
                  <label>Reason
                    <input placeholder="Contamination detected" value={recallReason} onChange={(e) => setRecallReason(e.target.value)} />
                  </label>
                </div>
                <button className="btn-danger" onClick={recallBatch} disabled={loading}>
                  {loading ? "Filing…" : "Recall Batch"}
                </button>
              </section>
            )}

            {activeTab === "track" && (
              <section>
                <h2>Track a Batch</h2>
                <p className="section-sub">Enter a Batch ID to see its full chain of custody and current status.</p>
                <div className="field-grid">
                  <label>Batch ID
                    <input placeholder="MED101" value={trackId} onChange={(e) => setTrackId(e.target.value)} />
                  </label>
                </div>
                <button className="btn-secondary" onClick={trackBatch} disabled={loading}>
                  {loading ? "Searching…" : "Track Batch"}
                </button>

                {isRecalledAndInvolved && (
                  <div className="alert-banner">
                    🚨 RECALL ALERT — this batch involves your address. Reason: {batchDetails[8]}
                  </div>
                )}

                {batchDetails && (
                  <div className="track-result">
                    <div className={status === "RECALLED" ? "stamp stamp-recalled" : "stamp stamp-safe"}>
                      {status}
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

                    <h3 className="timeline-title">Chain of Custody</h3>
                    <div className="timeline">
                      <div className="timeline-step">
                        <span className="dot dot-start" />
                        <div>
                          <p className="timeline-label">Created</p>
                          <p className="mono small">{shortAddr(batchDetails[2])}</p>
                        </div>
                      </div>

                      {history.map((h, i) => (
                        <div className="timeline-step" key={i}>
                          <span className="dot" />
                          <div>
                            <p className="timeline-label">Transferred</p>
                            <p className="mono small">{shortAddr(h[0])} → {shortAddr(h[1])}</p>
                            <p className="timestamp">{formatTimestamp(h[2])}</p>
                          </div>
                        </div>
                      ))}

                      {status === "RECALLED" && (
                        <div className="timeline-step">
                          <span className="dot dot-recalled" />
                          <div>
                            <p className="timeline-label recalled-label">Recalled</p>
                            <p className="small">{batchDetails[9]}</p>
                          </div>
                        </div>
                      )}
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