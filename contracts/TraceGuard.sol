// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TraceGuard {

    struct Batch {
        string batchId;
        string productName;
        address manufacturer;
        string mfgDate;
        string expiryDate;
        address currentOwner;
        bool isRecalled;
        string recallReason;
    }

    // Stores all batches using Batch ID
    mapping(string => Batch) public batches;

    // Add a new product batch
    function addBatch(
        string memory _batchId,
        string memory _productName,
        string memory _mfgDate,
        string memory _expiryDate
    ) public {

        require(
            bytes(batches[_batchId].batchId).length == 0,
            "Batch already exists"
        );

        batches[_batchId] = Batch({
            batchId: _batchId,
            productName: _productName,
            manufacturer: msg.sender,
            mfgDate: _mfgDate,
            expiryDate: _expiryDate,
            currentOwner: msg.sender,
            isRecalled: false,
            recallReason: ""
        });
    }

    // Transfer ownership of a batch
    function transferOwnership(
        string memory _batchId,
        address _newOwner
    ) public {

        require(
            bytes(batches[_batchId].batchId).length != 0,
            "Batch does not exist"
        );

        require(
            msg.sender == batches[_batchId].currentOwner,
            "Only current owner can transfer ownership"
        );

        batches[_batchId].currentOwner = _newOwner;
    }

    // Recall a batch
    function recallBatch(
        string memory _batchId,
        string memory _reason
    ) public {

        require(
            bytes(batches[_batchId].batchId).length != 0,
            "Batch does not exist"
        );

        require(
            msg.sender == batches[_batchId].manufacturer,
            "Only manufacturer can recall"
        );

        batches[_batchId].isRecalled = true;
        batches[_batchId].recallReason = _reason;
    }

    // Get complete batch details
    function getBatchDetails(
        string memory _batchId
    )
        public
        view
        returns (
            string memory,
            string memory,
            address,
            string memory,
            string memory,
            address,
            bool,
            string memory
        )
    {
        Batch memory b = batches[_batchId];

        return (
            b.batchId,
            b.productName,
            b.manufacturer,
            b.mfgDate,
            b.expiryDate,
            b.currentOwner,
            b.isRecalled,
            b.recallReason
        );
    }

    // Check if a batch is recalled
    function checkStatus(
        string memory _batchId
    ) public view returns (bool) {

        return batches[_batchId].isRecalled;
    }
}