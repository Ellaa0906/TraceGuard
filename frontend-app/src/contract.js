import { ethers } from "ethers";
import abi from "./abi.json";
import { contractAddress } from "./contractAddress";

export async function getContract() {

    if (!window.ethereum) {
        alert("Please install MetaMask");
        return;
    }

    await window.ethereum.request({
        method: "eth_requestAccounts"
    });

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    return new ethers.Contract(
        contractAddress,
        abi,
        signer
    );
}