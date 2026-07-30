import { useState } from "react";
import { getContract } from "./contract";

function App() {

  // Add Batch states
  const [batchId, setBatchId] = useState("");
  const [productName, setProductName] = useState("");
  const [mfgDate, setMfgDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  // View Batch states
  const [searchId, setSearchId] = useState("");
  const [batchDetails, setBatchDetails] = useState(null);

  // Status message
  const [message, setMessage] = useState("");

  // ---------------- ADD BATCH ----------------

  async function addBatch() {

    try {

      const contract = await getContract();

      const transaction = await contract.addBatch(
        batchId,
        productName,
        mfgDate,
        expiryDate
      );

      await transaction.wait();

      setMessage("Batch added successfully ✅");

    } catch (error) {

      console.error("Add Batch Error:", error);

      if (error.reason) {
        setMessage(error.reason);
      }
      else if (error.shortMessage) {
        setMessage(error.shortMessage);
      }
      else if (error.message) {
        setMessage(error.message);
      }
      else {
        setMessage("Failed to add batch ❌");
      }

    }

  }

  // ---------------- GET BATCH DETAILS ----------------

  async function getBatchDetails() {

    try {

      const contract = await getContract();

      const batch = await contract.getBatchDetails(searchId);

      console.log(batch);

      setBatchDetails(batch);

      setMessage("Batch found ✅");

    } catch (error) {

      console.error("Search Error:", error);

      if (error.reason) {
        setMessage(error.reason);
      }
      else if (error.shortMessage) {
        setMessage(error.shortMessage);
      }
      else if (error.message) {
        setMessage(error.message);
      }
      else {
        setMessage("Batch not found ❌");
      }

    }

  }

  // ---------------- CHECK STATUS ----------------

  async function checkStatus() {

    try {

      const contract = await getContract();

      const status = await contract.checkStatus(searchId);

      setMessage("Product Status : " + status);

    } catch (error) {

      console.error("Status Error:", error);

      if (error.reason) {
        setMessage(error.reason);
      }
      else if (error.shortMessage) {
        setMessage(error.shortMessage);
      }
      else if (error.message) {
        setMessage(error.message);
      }

    }

  }

  return (

    <div style={{ padding: "30px" }}>

      <h1>TraceGuard Blockchain Supply Chain</h1>

      {/* ADD BATCH */}

      <h2>Add Product Batch</h2>

      <input
        placeholder="Batch ID"
        value={batchId}
        onChange={(e) => setBatchId(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="Product Name"
        value={productName}
        onChange={(e) => setProductName(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="Manufacturing Date"
        value={mfgDate}
        onChange={(e) => setMfgDate(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="Expiry Date"
        value={expiryDate}
        onChange={(e) => setExpiryDate(e.target.value)}
      />

      <br /><br />

      <button onClick={addBatch}>
        Add Batch
      </button>

      <hr />

      {/* SEARCH */}

      <h2>View Batch Details</h2>

      <input
        placeholder="Enter Batch ID"
        value={searchId}
        onChange={(e) => setSearchId(e.target.value)}
      />

      <br /><br />

      <button onClick={getBatchDetails}>
        Search Batch
      </button>

      <button onClick={checkStatus}>
        Check Status
      </button>

      <br /><br />

      {batchDetails && (

        <div>

          <h3>Batch Information</h3>

          <p><b>Batch ID:</b> {batchDetails[0]}</p>

          <p><b>Product Name:</b> {batchDetails[1]}</p>

          <p><b>Manufacturer:</b> {batchDetails[2]}</p>

          <p><b>Manufacturing Date:</b> {batchDetails[3]}</p>

          <p><b>Expiry Date:</b> {batchDetails[4]}</p>

          <p><b>Current Owner:</b> {batchDetails[5]}</p>

          <p>
            <b>Recalled:</b>{" "}
            {batchDetails[6] ? "YES" : "NO"}
          </p>

          <p><b>Recall Reason:</b> {batchDetails[7]}</p>

        </div>

      )}

      <br />

      <h3>{message}</h3>

    </div>

  );

}

export default App;