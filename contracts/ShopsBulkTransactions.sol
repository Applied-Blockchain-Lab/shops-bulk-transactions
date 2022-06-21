//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract ShopsBulkTransactions is ReentrancyGuard {
    string public symbol;

    constructor(string memory _symbol) {
        symbol = _symbol;
    }

    event MultiTransfer(uint256 _amount, bool _status);

    function _safeCall(address payable _to, uint256 _amount) internal {
        require(_to != address(0), "Address can't be 0");
        (bool sent, ) = _to.call{value: _amount}("");
        require(sent, string(abi.encodePacked("Failed to send ", symbol)));
    }

    function multiTransfer(
        address payable[] memory _addresses,
        uint256[] memory _amounts
    ) public payable nonReentrant {
        require(
            _addresses.length == _amounts.length,
            "Addresses length must be equal to amounts length"
        );

        uint256 constTotal = msg.value;
        uint256 total = msg.value;

        for (uint256 i = 0; i < _addresses.length; i++) {
            require(
                total >= _amounts[i],
                "Total amount is less than current send amount"
            );
            total = total - _amounts[i];
            _safeCall(_addresses[i], _amounts[i]);
        }

        emit MultiTransfer(constTotal, true);
    }
}