// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MedSafe {
    struct Batch {
        string batchId;
        string productName;
        address manufacturer;
        address distributor;
        address retailer;
        string mfgDate;
        string expiryDate;
        address currentOwner;
        bool isRecalled;
        string recallReason;
        bool isReceived;
        string[] transferHistory;
    }

    struct ProblemReport {
        address reportedBy;
        string problem;
        uint256 timestamp;
        bool exists;
        bool resolved;
    }

    mapping(string => Batch) public batches;
    mapping(string => ProblemReport) public problemReports;
    string[] public allBatchIds;

    event BatchCreated(string batchId, string productName, address manufacturer, string mfgDate, string expiryDate);
    event BatchTransferred(string batchId, address from, address to, string role);
    event BatchRecalled(string batchId, string reason);
    event ProblemReported(string batchId, address reportedBy, string problem, uint256 timestamp);
    event ProblemResolved(string batchId);
    event BatchReceived(string batchId, address receivedBy);

    function createBatch(
        string memory _batchId,
        string memory _productName,
        string memory _mfgDate,
        string memory _expiryDate
    ) public {
        require(bytes(batches[_batchId].batchId).length == 0, "Batch already exists");

        string[] memory initialHistory = new string[](1);
        initialHistory[0] = "Created by Manufacturer";

        batches[_batchId] = Batch({
            batchId: _batchId,
            productName: _productName,
            manufacturer: msg.sender,
            distributor: address(0),
            retailer: address(0),
            mfgDate: _mfgDate,
            expiryDate: _expiryDate,
            currentOwner: msg.sender,
            isRecalled: false,
            recallReason: "",
            isReceived: false,
            transferHistory: initialHistory
        });

        allBatchIds.push(_batchId);
        emit BatchCreated(_batchId, _productName, msg.sender, _mfgDate, _expiryDate);
    }

    function transferBatch(string memory _batchId, address _to, string memory _role) public {
        Batch storage batch = batches[_batchId];
        require(bytes(batch.batchId).length > 0, "Batch does not exist");
        require(msg.sender == batch.currentOwner, "Only current owner can transfer");
        require(!batch.isRecalled, "Cannot transfer a recalled batch");

        address previousOwner = batch.currentOwner;
        batch.currentOwner = _to;
        batch.isReceived = false;

        if (keccak256(bytes(_role)) == keccak256(bytes("Distributor"))) {
            batch.distributor = _to;
        } else if (keccak256(bytes(_role)) == keccak256(bytes("Retailer"))) {
            batch.retailer = _to;
        }

        string memory historyEntry = string(abi.encodePacked("Transferred to ", _role));
        batch.transferHistory.push(historyEntry);

        emit BatchTransferred(_batchId, previousOwner, _to, _role);
    }

    function markReceived(string memory _batchId) public {
        Batch storage batch = batches[_batchId];
        require(bytes(batch.batchId).length > 0, "Batch does not exist");
        require(msg.sender == batch.currentOwner, "Only current owner can confirm receipt");
        require(!batch.isRecalled, "Cannot confirm receipt of a recalled batch");

        batch.isReceived = true;
        batch.transferHistory.push("Marked as Received");

        emit BatchReceived(_batchId, msg.sender);
    }

    function reportProblem(string memory _batchId, string memory _problem) public {
        Batch storage batch = batches[_batchId];
        require(bytes(batch.batchId).length > 0, "Batch does not exist");
        require(!batch.isRecalled, "Batch is already recalled");

        problemReports[_batchId] = ProblemReport({
            reportedBy: msg.sender,
            problem: _problem,
            timestamp: block.timestamp,
            exists: true,
            resolved: false
        });

        emit ProblemReported(_batchId, msg.sender, _problem, block.timestamp);
    }

    function resolveProblem(string memory _batchId) public {
        Batch storage batch = batches[_batchId];
        require(bytes(batch.batchId).length > 0, "Batch does not exist");
        require(msg.sender == batch.manufacturer, "Only manufacturer can resolve");
        require(problemReports[_batchId].exists, "No problem report found");
        require(!problemReports[_batchId].resolved, "Already resolved");

        problemReports[_batchId].resolved = true;
        batch.transferHistory.push("Problem Resolved by Manufacturer");

        emit ProblemResolved(_batchId);
    }

    function recallBatch(string memory _batchId, string memory _reason) public {
        Batch storage batch = batches[_batchId];
        require(bytes(batch.batchId).length > 0, "Batch does not exist");
        require(msg.sender == batch.manufacturer, "Only manufacturer can recall");

        batch.isRecalled = true;
        batch.recallReason = _reason;
        batch.transferHistory.push("Recalled by Manufacturer");

        emit BatchRecalled(_batchId, _reason);
    }

    function getBatch(string memory _batchId) public view returns (Batch memory) {
        require(bytes(batches[_batchId].batchId).length > 0, "Batch does not exist");
        return batches[_batchId];
    }

    function getProblemReport(string memory _batchId) public view returns (ProblemReport memory) {
        return problemReports[_batchId];
    }
}