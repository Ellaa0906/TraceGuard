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


  // Add Batch Function
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

    } catch(error) {

      console.log(error);
      setMessage("Failed to add batch ❌");

    }

  }



  // Get Batch Details Function
 async function getBatchDetails() {

  try {

    const contract = await getContract();

    const batch = await contract.getBatchDetails(searchId);

    console.log("Batch data:", batch);

    setBatchDetails(batch);

    setMessage("Batch found ✅");

  } catch(error) {

    console.log(error);
    setMessage("Batch not found ❌");

  }

}



  // Check Status Function
  async function checkStatus(){

    try{

      const contract = await getContract();

      const status = await contract.checkStatus(searchId);

      setMessage(
        "Product Status: " + status
      );

    }
    catch(error){

      console.log(error);

    }

  }



  return (

    <div style={{padding:"30px"}}>


      <h1>TraceGuard Blockchain Supply Chain</h1>


      {/* ADD BATCH */}

      <h2>Add Product Batch</h2>


      <input
        placeholder="Batch ID"
        onChange={(e)=>setBatchId(e.target.value)}
      />

      <br/><br/>


      <input
        placeholder="Product Name"
        onChange={(e)=>setProductName(e.target.value)}
      />

      <br/><br/>


      <input
        placeholder="Manufacturing Date"
        onChange={(e)=>setMfgDate(e.target.value)}
      />

      <br/><br/>


      <input
        placeholder="Expiry Date"
        onChange={(e)=>setExpiryDate(e.target.value)}
      />

      <br/><br/>


      <button onClick={addBatch}>
        Add Batch
      </button>



      <hr/>


      {/* VIEW BATCH */}

      <h2>View Batch Details</h2>


      <input
        placeholder="Enter Batch ID"
        onChange={(e)=>setSearchId(e.target.value)}
      />

      <br/><br/>


      <button onClick={getBatchDetails}>
        Search Batch
      </button>


      <button onClick={checkStatus}>
        Check Status
      </button>



      <br/><br/>


      {
        batchDetails && (

          <div>

            <h3>Batch Information</h3>


            <p>
              Batch ID: {batchDetails[0]}
            </p>


            <p>
              Product Name: {batchDetails[1]}
            </p>


            <p>
              Manufacturer: {batchDetails[2]}
            </p>


            <p>
              Manufacturing Date: {batchDetails[3]}
            </p>


            <p>
              Expiry Date: {batchDetails[4]}
            </p>


            <p>
              Current Owner: {batchDetails[5]}
            </p>


            <p>
              Recalled:
              {
                batchDetails[6]
                ? " YES"
                : " NO"
              }
            </p>


            <p>
              Recall Reason:
              {batchDetails[7]}
            </p>


          </div>

        )
      }



      <h3>
        {message}
      </h3>


    </div>

  );

}


export default App;