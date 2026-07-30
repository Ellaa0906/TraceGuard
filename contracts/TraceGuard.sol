// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

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

    mapping(string => Batch) public batches;

    function addBatch(
        string memory _batchId,
        string memory _productName,
        string memory _mfgDate,
        string memory _expiryDate
    ) public {
        batches[_batchId] = Batch(
            _batchId, _productName, msg.sender,
            _mfgDate, _expiryDate, msg.sender, false, ""
        );
    }

    function transferOwnership(string memory _batchId, address _newOwner) public {
        require(msg.sender == batches[_batchId].currentOwner, "Not the owner");
        batches[_batchId].currentOwner = _newOwner;
    }

    function recallBatch(string memory _batchId, string memory _reason) public {
        require(msg.sender == batches[_batchId].manufacturer, "Not the manufacturer");
        batches[_batchId].isRecalled = true;
        batches[_batchId].recallReason = _reason;
    }

    function getBatchDetails(string memory _batchId) public view returns (Batch memory) {
        return batches[_batchId];
    }

    function checkStatus(string memory _batchId) public view returns (string memory) {
        if (batches[_batchId].isRecalled) {
            return "RECALLED";
        }
        return "SAFE";
    }
}