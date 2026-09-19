import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    console.log("");
    console.log("======================================");
    console.log("          MEDSAFE DEMO SETUP");
    console.log("======================================");
    console.log("");

    const { ethers } = await hre.network.connect();

    const signers = await ethers.getSigners();

    const manufacturer = signers[5];
    const distributor = signers[6];
    const retailer = signers[7];

    console.log("Manufacturer:", manufacturer.address);
    console.log("Distributor :", distributor.address);
    console.log("Retailer    :", retailer.address);

    // ==================================
    // DEPLOY
    // ==================================

    console.log("");
    console.log("Deploying MedSafe...");

    const MedSafe = await ethers.getContractFactory("MedSafe");

    const medSafe = await MedSafe.deploy();

    await medSafe.waitForDeployment();

    const contractAddress = await medSafe.getAddress();
    const frontendAddressFile = path.join(
    __dirname,
    "..",
    "frontend-app",
    "src",
    "contractAddress.js"
);

fs.writeFileSync(
    frontendAddressFile,
    `export const contractAddress = "${contractAddress}";\n`
);

console.log(
    "Frontend contract address updated automatically."
);

    console.log("MedSafe deployed at:", contractAddress);

    // ==================================
    // ASSIGN ROLES
    // ==================================

    console.log("");
    console.log("Assigning roles...");

    let tx;

    tx = await medSafe.assignRole(
        manufacturer.address,
        1
    );
    await tx.wait();

    tx = await medSafe.assignRole(
        distributor.address,
        2
    );
    await tx.wait();

    tx = await medSafe.assignRole(
        retailer.address,
        3
    );
    await tx.wait();

    console.log("Manufacturer role assigned.");
    console.log("Distributor role assigned.");
    console.log("Retailer role assigned.");

    // ==================================
    // CREATE BATCH
    // ==================================

    console.log("");
    console.log("Creating Batch 102...");

    tx = await medSafe
        .connect(manufacturer)
        .addBatch(
            "102",
            "Paracetamol",
            "19-09-2026",
            "19-09-2028",
            distributor.address
        );

    await tx.wait();

    console.log("Batch 102 created.");

    // ==================================
    // MANUFACTURER → DISTRIBUTOR
    // ==================================

    console.log("");
    console.log("Transferring Manufacturer -> Distributor...");

    tx = await medSafe
        .connect(manufacturer)
        .transferOwnership(
            "102",
            distributor.address
        );

    await tx.wait();

    console.log("Transferred to Distributor.");

    // ==================================
    // DISTRIBUTOR → RETAILER
    // ==================================

    console.log("");
    console.log("Transferring Distributor -> Retailer...");

    tx = await medSafe
        .connect(distributor)
        .transferOwnership(
            "102",
            retailer.address
        );

    await tx.wait();

    console.log("Transferred to Retailer.");

    // ==================================
    // RECALL
    // ==================================

    console.log("");
    console.log("Recalling Batch 102...");

    tx = await medSafe
        .connect(manufacturer)
        .recallBatch(
            "102",
            "Quality issue detected"
        );

    await tx.wait();

    console.log("Batch 102 recalled.");

    // ==================================
    // FINAL DETAILS
    // ==================================

    const batch = await medSafe.getBatchDetails("102");

    console.log("");
    console.log("======================================");
    console.log("             DEMO READY");
    console.log("======================================");

    console.log("");
    console.log("CONTRACT:");
    console.log(contractAddress);

    console.log("");
    console.log("BATCH DETAILS");
    console.log("--------------------------------------");

    console.log("Batch ID:", batch.batchId);
    console.log("Product:", batch.productName);
    console.log("Manufacturer:", batch.manufacturer);
    console.log("Distributor:", batch.distributor);
    console.log("Retailer:", batch.retailer);
    console.log("Current Owner:", batch.currentOwner);
    console.log("Manufacturing Date:", batch.mfgDate);
    console.log("Expiry Date:", batch.expiryDate);
    console.log("Recalled:", batch.isRecalled);
    console.log("Recall Reason:", batch.recallReason);

    console.log("");
    console.log("======================================");
    console.log("      MEDSAFE IS READY FOR DEMO");
    console.log("======================================");
    console.log("");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});