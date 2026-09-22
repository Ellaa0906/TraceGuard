// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MedSafe {

    enum Role {
        None,
        Manufacturer,
        Distributor,
        Retailer
    }

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

    address private admin;

    mapping(address => Role) public roles;
    mapping(string => Batch) public batches;
    mapping(string => TransferRecord[]) public transferHistory;

    event RoleAssigned(address account, Role role);

    event BatchCreated(
        string batchId,
        address manufacturer
    );

    event OwnershipTransferred(
        string batchId,
        address from,
        address to
    );

    event BatchRecalled(
        string batchId,
        string reason
    );

    constructor() {
        admin = msg.sender;
    }

    function assignRole(
        address _account,
        Role _role
    ) public {
        require(msg.sender == admin, "Only admin can assign roles");

        roles[_account] = _role;

        emit RoleAssigned(_account, _role);
    }

    function getRole(
        address _account
    ) public view returns (Role) {
        return roles[_account];
    }

    function addBatch(
        string memory _batchId,
        string memory _productName,
        string memory _mfgDate,
        string memory _expiryDate,
        address _distributor
    ) public {
        require(
            roles[msg.sender] == Role.Manufacturer,
            "Only manufacturer can add batch"
        );

        require(
            bytes(batches[_batchId].batchId).length == 0,
            "Batch already exists"
        );

        require(
            roles[_distributor] == Role.Distributor,
            "Address must be distributor"
        );

        batches[_batchId] = Batch({
            batchId: _batchId,
            productName: _productName,
            manufacturer: msg.sender,
            distributor: _distributor,
            retailer: address(0),
            mfgDate: _mfgDate,
            expiryDate: _expiryDate,
            currentOwner: _distributor,
            isRecalled: false,
            recallReason: ""
        });

        transferHistory[_batchId].push(
            TransferRecord({
                from: msg.sender,
                to: _distributor,
                timestamp: block.timestamp
            })
        );

        emit BatchCreated(_batchId, msg.sender);

        emit OwnershipTransferred(
            _batchId,
            msg.sender,
            _distributor
        );
    }

    function transferOwnership(
        string memory _batchId,
        address _newOwner
    ) public {
        Batch storage batch = batches[_batchId];

        require(
            bytes(batch.batchId).length > 0,
            "Batch does not exist"
        );

        require(
            msg.sender == batch.currentOwner,
            "Only current owner can transfer"
        );

        require(
            !batch.isRecalled,
            "Cannot transfer recalled batch"
        );

        require(
            roles[msg.sender] == Role.Distributor &&
            roles[_newOwner] == Role.Retailer,
            "Invalid custody transfer"
        );

        address previousOwner = batch.currentOwner;

        batch.retailer = _newOwner;
        batch.currentOwner = _newOwner;

        transferHistory[_batchId].push(
            TransferRecord({
                from: previousOwner,
                to: _newOwner,
                timestamp: block.timestamp
            })
        );

        emit OwnershipTransferred(
            _batchId,
            previousOwner,
            _newOwner
        );
    }

    function recallBatch(
        string memory _batchId,
        string memory _reason
    ) public {
        Batch storage batch = batches[_batchId];

        require(
            bytes(batch.batchId).length > 0,
            "Batch does not exist"
        );

        require(
            msg.sender == batch.manufacturer,
            "Only manufacturer can recall"
        );

        batch.isRecalled = true;
        batch.recallReason = _reason;

        emit BatchRecalled(
            _batchId,
            _reason
        );
    }

    function getBatchDetails(
        string memory _batchId
    ) public view returns (Batch memory) {
        require(
            bytes(batches[_batchId].batchId).length > 0,
            "Batch does not exist"
        );

        return batches[_batchId];
    }

    function checkStatus(
        string memory _batchId
    ) public view returns (string memory) {
        require(
            bytes(batches[_batchId].batchId).length > 0,
            "Batch does not exist"
        );

        if (batches[_batchId].isRecalled) {
            return "RECALLED";
        }

        return "SAFE";
    }

    function getTransferHistory(
        string memory _batchId
    ) public view returns (TransferRecord[] memory) {
        return transferHistory[_batchId];
    }
}