//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract ShopsBulkTransactions is ReentrancyGuard {
    address ARBITRATOR;

    struct Order {
        bytes32 orderHash;
        string productHash;
        string clientWebId;
        uint256 value;
        address client;
        address seller;
        address arbitrator;
        //0 - no decision
        //1 - process transaction
        //2 - return money to client
        uint8 clientDecision;
        uint8 sellerDecision;
        uint8 arbitratorDecision;
        uint256 deadline;
        bool active;
    }

    mapping(bytes32 => Order[]) activeOrders;
    mapping(address => bytes32[]) clients;
    mapping(address => bytes32[]) sellers;

    string public symbol;

    constructor(string memory _symbol, address arbitrator) {
        symbol = _symbol;
        ARBITRATOR = arbitrator;
    }

    event MultiTransfer(uint256 _amount, bool _status);

    function _safeCall(address payable _to, uint256 _amount) internal {
        require(_to != address(0), "Address can't be 0");
        (bool sent, ) = _to.call{value: _amount}("");
        require(sent, string(abi.encodePacked("Failed to send ", symbol)));
    }

    function calculateHash(Order memory order) internal pure returns (bytes32) {
        bytes32 orderHash = keccak256(
            abi.encodePacked(
                order.client,
                order.seller,
                order.arbitrator,
                order.sellerDecision,
                order.clientDecision,
                order.arbitratorDecision,
                order.value,
                order.productHash,
                order.clientWebId,
                order.deadline,
                order.active
            )
        );

        return orderHash;
    }

    function arbitratorProccessTransaction(
        address[] memory _clients,
        address[] memory _sellers,
        bytes32[] memory _orderHashes
    ) external nonReentrant {
        require(
            _clients.length == _orderHashes.length,
            "Addresses length must be equal to order hashes length."
        );
        require(
            _clients.length == _sellers.length,
            "Clients length must be equal to sellers length"
        );

        for (uint256 i = 0; i < _clients.length; i++) {
            arbitratorDecision(_clients[i], _sellers[i], 1, _orderHashes[i]);
        }
    }

    function arbitratorRevertTransaction(
        address[] memory _clients,
        address[] memory _sellers,
        bytes32[] memory _orderHashes
    ) external nonReentrant {
        require(
            _clients.length == _orderHashes.length,
            "Addresses length must be equal to order hashes length."
        );
        require(
            _clients.length == _sellers.length,
            "Clients length must be equal to sellers length"
        );

        for (uint256 i = 0; i < _clients.length; i++) {
            arbitratorDecision(_clients[i], _sellers[i], 2, _orderHashes[i]);
        }
    }

    function arbitratorDecision(
        address client,
        address seller,
        uint8 arbitratorChoice,
        bytes32 orderHash
    ) internal {
        bytes32 index = keccak256(abi.encodePacked(client, seller));
        for (uint256 i = 0; i < activeOrders[index].length; i++) {
            if (
                (activeOrders[index][i].orderHash == orderHash) &&
                (activeOrders[index][i].active == true)
            ) {
                require(
                    activeOrders[index][i].arbitrator == msg.sender,
                    "You are not the arbitrator."
                );
                activeOrders[index][i].arbitratorDecision = arbitratorChoice;
                activeOrders[index][i].orderHash = calculateHash(
                    activeOrders[index][i]
                );
                uint8 decision = checkDecisions(activeOrders[index][i]);
                if (decision == 1) {
                    activeOrders[index][i].active = false;
                    activeOrders[index][i].orderHash = calculateHash(
                        activeOrders[index][i]
                    );
                    _safeCall(
                        payable(activeOrders[index][i].seller),
                        activeOrders[index][i].value
                    );
                    activeOrders[index][i] = activeOrders[index][
                        activeOrders[index].length - 1
                    ];
                    activeOrders[index].pop();
                } else if (decision == 2) {
                    activeOrders[index][i].active = false;
                    activeOrders[index][i].orderHash = calculateHash(
                        activeOrders[index][i]
                    );
                    _safeCall(
                        payable(activeOrders[index][i].client),
                        activeOrders[index][i].value
                    );
                    activeOrders[index][i] = activeOrders[index][
                        activeOrders[index].length - 1
                    ];
                    activeOrders[index].pop();
                }
                break;
            }
        }
    }

    function sellerProccessTransaction(
        address[] memory _clients,
        bytes32[] memory _orderHashes
    ) external nonReentrant {
        require(
            _clients.length == _orderHashes.length,
            "Addresses length must be equal to order hashes length."
        );
        require(_clients.length > 0, "No parameters.");

        for (uint256 i = 0; i < _clients.length; i++) {
            sellerDecision(_clients[i], 1, _orderHashes[i]);
        }
    }

    function sellerRevertTransaction(
        address[] memory _clients,
        bytes32[] memory _orderHashes
    ) external nonReentrant {
        require(
            _clients.length == _orderHashes.length,
            "Addresses length must be equal to order hashes length."
        );
        require(_clients.length > 0, "No parameters.");
        for (uint256 i = 0; i < _clients.length; i++) {
            sellerDecision(_clients[i], 2, _orderHashes[i]);
        }
    }

    function sellerDecision(
        address client,
        uint8 sellerChoice,
        bytes32 orderHash
    ) internal {
        bytes32 index = keccak256(abi.encodePacked(client, msg.sender));
        for (uint256 i = 0; i < activeOrders[index].length; i++) {
            if (
                (activeOrders[index][i].orderHash == orderHash) &&
                (activeOrders[index][i].active == true)
            ) {
                require(
                    activeOrders[index][i].seller == msg.sender,
                    "You are not the seller."
                );
                activeOrders[index][i].sellerDecision = sellerChoice;
                activeOrders[index][i].orderHash = calculateHash(
                    activeOrders[index][i]
                );
                uint8 decision = checkDecisions(activeOrders[index][i]);

                if (decision == 1) {
                    activeOrders[index][i].active = false;
                    activeOrders[index][i].orderHash = calculateHash(
                        activeOrders[index][i]
                    );
                    _safeCall(
                        payable(activeOrders[index][i].seller),
                        activeOrders[index][i].value
                    );
                    activeOrders[index][i] = activeOrders[index][
                        activeOrders[index].length - 1
                    ];
                    activeOrders[index].pop();
                } else if (decision == 2) {
                    activeOrders[index][i].active = false;
                    activeOrders[index][i].orderHash = calculateHash(
                        activeOrders[index][i]
                    );
                    _safeCall(
                        payable(activeOrders[index][i].client),
                        activeOrders[index][i].value
                    );
                    activeOrders[index][i] = activeOrders[index][
                        activeOrders[index].length - 1
                    ];
                    activeOrders[index].pop();
                } else if (
                    activeOrders[index][i].deadline < block.timestamp &&
                    activeOrders[index][i].clientDecision == 0
                ) {
                    activeOrders[index][i].active = false;
                    activeOrders[index][i].orderHash = calculateHash(
                        activeOrders[index][i]
                    );
                    _safeCall(
                        payable(activeOrders[index][i].seller),
                        activeOrders[index][i].value
                    );
                    activeOrders[index][i] = activeOrders[index][
                        activeOrders[index].length - 1
                    ];
                    activeOrders[index].pop();
                }
                break;
            }
        }
    }

    function clientProccessTransaction(
        address[] memory _sellers,
        bytes32[] memory _orderHashes
    ) external nonReentrant {
        require(
            _sellers.length == _orderHashes.length,
            "Addresses length must be equal to order hashes length."
        );
        require(_sellers.length > 0, "No parameters.");
        for (uint256 i = 0; i < _sellers.length; i++) {
            clientDecision(_sellers[i], 1, _orderHashes[i]);
        }
    }

    function clientRevertTransaction(
        address[] memory _sellers,
        bytes32[] memory _orderHashes
    ) external nonReentrant {
        require(
            _sellers.length == _orderHashes.length,
            "Addresses length must be equal to order hashes length."
        );
        require(_sellers.length > 0, "No parameters.");
        for (uint256 i = 0; i < _sellers.length; i++) {
            clientDecision(_sellers[i], 2, _orderHashes[i]);
        }
    }

    function clientDecision(
        address seller,
        uint8 clientChoice,
        bytes32 orderHash
    ) internal {
        bytes32 index = keccak256(abi.encodePacked(msg.sender, seller));
        for (uint256 i = 0; i < activeOrders[index].length; i++) {
            if (
                (activeOrders[index][i].orderHash == orderHash) &&
                (activeOrders[index][i].active == true)
            ) {
                require(
                    activeOrders[index][i].client == msg.sender,
                    "You are not the client."
                );
                activeOrders[index][i].clientDecision = clientChoice;
                activeOrders[index][i].orderHash = calculateHash(
                    activeOrders[index][i]
                );
                uint8 decision = checkDecisions(activeOrders[index][i]);

                if (decision == 1) {
                    activeOrders[index][i].active = false;
                    activeOrders[index][i].orderHash = calculateHash(
                        activeOrders[index][i]
                    );
                    _safeCall(
                        payable(activeOrders[index][i].seller),
                        activeOrders[index][i].value
                    );
                    activeOrders[index][i] = activeOrders[index][
                        activeOrders[index].length - 1
                    ];
                    activeOrders[index].pop();
                } else if (decision == 2) {
                    activeOrders[index][i].active = false;
                    activeOrders[index][i].orderHash = calculateHash(
                        activeOrders[index][i]
                    );
                    _safeCall(
                        payable(activeOrders[index][i].client),
                        activeOrders[index][i].value
                    );
                    activeOrders[index][i] = activeOrders[index][
                        activeOrders[index].length - 1
                    ];
                    activeOrders[index].pop();
                }
                break;
            }
        }
    }

    function checkDecisions(Order memory order) internal pure returns (uint8) {
        if (order.clientDecision == order.sellerDecision) {
            return order.clientDecision;
        } else if (order.clientDecision == order.arbitratorDecision) {
            return order.clientDecision;
        } else if (order.arbitratorDecision == order.sellerDecision) {
            return order.arbitratorDecision;
        }

        return 0;
    }

    function sellerCheckOrders() external view returns (Order[] memory) {
        uint256 count = 0;
        bytes32[] memory indexes = sellers[msg.sender];
        for (uint256 i = 0; i < indexes.length; i++) {
            count += activeOrders[indexes[i]].length;
        }
        Order[] memory orders = new Order[](count);
        uint256 ordersIndex = 0;
        for (uint256 i = 0; i < indexes.length; i++) {
            Order[] memory currentOrders = activeOrders[indexes[i]];
            for (uint256 j = 0; j < currentOrders.length; j++) {
                orders[ordersIndex] = currentOrders[j];
                ordersIndex++;
            }
        }
        return orders;
    }

    function clientCheckOrders() external view returns (Order[] memory) {
        uint256 count = 0;
        bytes32[] memory indexes = clients[msg.sender];
        for (uint256 i = 0; i < indexes.length; i++) {
            count += activeOrders[indexes[i]].length;
        }
        Order[] memory orders = new Order[](count);
        uint256 ordersIndex = 0;
        for (uint256 i = 0; i < indexes.length; i++) {
            Order[] memory currentOrders = activeOrders[indexes[i]];
            for (uint256 j = 0; j < currentOrders.length; j++) {
                orders[ordersIndex] = currentOrders[j];
                ordersIndex++;
            }
        }
        return orders;
    }

    function clientCheckActiveOrders() external view returns (Order[] memory) {
        uint256 count = 0;
        bytes32[] memory indexes = clients[msg.sender];

        uint256 ordersIndex = 0;
        for (uint256 i = 0; i < indexes.length; i++) {
            Order[] memory currentOrders = activeOrders[indexes[i]];
            for (uint256 j = 0; j < currentOrders.length; j++) {
                if (currentOrders[j].active) {
                    count++;
                }
            }
        }
        Order[] memory orders = new Order[](count);
        for (uint256 i = 0; i < indexes.length; i++) {
            Order[] memory currentOrders = activeOrders[indexes[i]];
            for (uint256 j = 0; j < currentOrders.length; j++) {
                if (currentOrders[j].active) {
                    orders[ordersIndex] = currentOrders[j];
                    ordersIndex++;
                }
            }
        }
        return orders;
    }

    function sellerCheckActiveOrders() external view returns (Order[] memory) {
        uint256 count = 0;
        bytes32[] memory indexes = sellers[msg.sender];

        uint256 ordersIndex = 0;
        for (uint256 i = 0; i < indexes.length; i++) {
            Order[] memory currentOrders = activeOrders[indexes[i]];
            for (uint256 j = 0; j < currentOrders.length; j++) {
                if (currentOrders[j].active) {
                    count++;
                }
            }
        }
        Order[] memory orders = new Order[](count);
        for (uint256 i = 0; i < indexes.length; i++) {
            Order[] memory currentOrders = activeOrders[indexes[i]];
            for (uint256 j = 0; j < currentOrders.length; j++) {
                if (currentOrders[j].active) {
                    orders[ordersIndex] = currentOrders[j];
                    ordersIndex++;
                }
            }
        }
        return orders;
    }

    function checkProductOrders(address seller, string calldata productHash)
        external
        view
        returns (uint256)
    {
        uint256 count = 0;
        bytes32[] memory indexes = sellers[seller];

        uint256 ordersIndex = 0;
        for (uint256 i = 0; i < indexes.length; i++) {
            Order[] memory currentOrders = activeOrders[indexes[i]];
            for (uint256 j = 0; j < currentOrders.length; j++) {
                if (
                    keccak256(bytes(currentOrders[j].productHash)) ==
                    keccak256(bytes(productHash))
                ) {
                    count++;
                }
                ordersIndex++;
            }
        }
        return count;
    }

    function multiTransfer(
        address payable[] memory _addresses,
        uint256[] memory _amounts,
        string[] memory _productHashes,
        string memory _clientWebId
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

            Order memory o;
            o.client = msg.sender;
            o.seller = _addresses[i];
            o.arbitrator = ARBITRATOR;
            o.sellerDecision = 0;
            o.clientDecision = 0;
            o.arbitratorDecision = 0;
            o.value = _amounts[i];
            o.clientWebId = _clientWebId;
            o.productHash = _productHashes[i];
            o.deadline = block.timestamp + (30 * 24 * 60 * 60);
            o.active = true;
            o.orderHash = calculateHash(o);
            bytes32 index = keccak256(
                abi.encodePacked(msg.sender, _addresses[i])
            );
            activeOrders[index].push(o);
            if (activeOrders[index].length == 1) {
                clients[msg.sender].push(index);
                sellers[_addresses[i]].push(index);
            }
        }

        emit MultiTransfer(constTotal, true);
    }
}
