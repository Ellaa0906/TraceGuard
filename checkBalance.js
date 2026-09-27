import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

async function main() {
  const network = await provider.getNetwork();
  console.log("Chain ID:", network.chainId.toString());

  const addresses = {
    Manufacturer: "0x9965507d1a55bcc2695c58ba16fb37d819b0a4dc",
    Distributor: "0x976ea74026e726554db657fa54763abd0c3a0aa9",
    Retailer: "0x14dc79964da2c08b23698b3d3cc7ca32193d9955",
  };

  for (const [role, addr] of Object.entries(addresses)) {
    const balance = await provider.getBalance(addr);
    console.log(role, addr, "=>", ethers.formatEther(balance), "ETH");
  }
}

main().catch(console.error);