// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MedSafe {

    enum Role { None, Manufacturer, Distributor, Retailer }

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
    }

    struct TransferRecord {
        address from;
        address to;
        uint256 timestamp;
    }

    mapping(string => Batch) public batches;
    mapping(string => TransferRecord[]) public transferHistory;
    mapping(address => Role) public roles;

    event BatchCreated(string batchId, address manufacturer);
    event RoleAssigned(address account, Role role);
    event OwnershipTransferred(string batchId, address from, address to);
    event BatchRecalled(string batchId, string reason);

    // ---------------- ROLE MANAGEMENT ----------------

    function assignRole(address _account, Role _role) public {
        roles[_account] = _role;
        emit RoleAssigned(_account, _role);
    }

    function getRole(address _account) public view returns (Role) {
        return roles[_account];
    }

    // ---------------- BATCH CREATION ----------------

    function addBatch(
        string memory _batchId,
        string memory _productName,
        string memory _mfgDate,
        string memory _expiryDate,
        address _distributor
    ) public {
        require(bytes(batches[_batchId].batchId).length == 0, "Batch ID already exists");

        batches[_batchId] = Batch(
            _batchId,
            _productName,
            msg.sender,
            _distributor,
            address(0),
            _mfgDate,
            _expiryDate,
            msg.sender,
            false,
            ""
        );

        emit BatchCreated(_batchId, msg.sender);
    }

    // ---------------- TRANSFER ----------------

    function transferOwnership(string memory _batchId, address _newOwner) public {
        require(msg.sender == batches[_batchId].currentOwner, "Not the current owner");

        // Track retailer once it reaches that stage
        if (batches[_batchId].distributor == msg.sender) {
            batches[_batchId].retailer = _newOwner;
        }

        transferHistory[_batchId].push(TransferRecord(msg.sender, _newOwner, block.timestamp));

        batches[_batchId].currentOwner = _newOwner;

        emit OwnershipTransferred(_batchId, msg.sender, _newOwner);
    }

    // ---------------- RECALL ----------------

    function recallBatch(string memory _batchId, string memory _reason) public {
        require(msg.sender == batches[_batchId].manufacturer, "Not the manufacturer");
        batches[_batchId].isRecalled = true;
        batches[_batchId].recallReason = _reason;
        emit BatchRecalled(_batchId, _reason);
    }

    // ---------------- READ FUNCTIONS ----------------

    function getBatchDetails(string memory _batchId) public view returns (Batch memory) {
        return batches[_batchId];
    }

    function checkStatus(string memory _batchId) public view returns (string memory) {
        if (batches[_batchId].isRecalled) {
            return "RECALLED";
        }
        return "SAFE";
    }

    function getTransferHistory(string memory _batchId) public view returns (TransferRecord[] memory) {
        return transferHistory[_batchId];
    }
}