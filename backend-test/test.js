require('dotenv').config();
const { ethers } = require("ethers");
const abi = require("../frontend-app/src/abi.json");

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, wallet);

async function main() {
  const tx = await contract.addBatch("MED102", "Ibuprofen", "26-07-2026", "26-07-2028");
  await tx.wait();
  console.log("Batch MED102 created!");

  const details = await contract.getBatchDetails("MED102");
  console.log(details);
}

main();