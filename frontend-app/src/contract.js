import { ethers } from "ethers";
import abi from "./abi.json";
import { contractAddress } from "./contractAddress";

export async function getContract() {

    if (!window.ethereum) {
        alert("Please install MetaMask");
        return;
    }

    // Request MetaMask connection
    await window.ethereum.request({
        method: "eth_requestAccounts"
    });

    // Create provider
    const provider = new ethers.BrowserProvider(window.ethereum);

    // Get signer (currently selected MetaMask account)
    const signer = await provider.getSigner();

    // Display connected wallet in browser console
    const address = await signer.getAddress();
    console.log("Connected Wallet:", address);

    // Return contract instance
    const contract = new ethers.Contract(
        contractAddress,
        abi,
        signer
    );

    return contract;
}