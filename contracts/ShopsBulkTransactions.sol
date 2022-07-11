//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract ShopsBulkTransactions is ReentrancyGuard {



struct Order{
    uint value;
    address client;
    address sellar;
    //0 - no decision
    //1 - process transaction
    //2 - return money to client
    uint8 clientDecision;
    uint8 sellerDecision;
}

 mapping(bytes32 => Order[]) activeOrders;
 mapping(address =>bytes32[])clients;
 mapping(address =>bytes32[])sellers;









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




     function sellerProccessTransaction(address client,uint value) external nonReentrant{
           sellerDecision(client, value, 1);
            
    }

     function sellerRevertTransaction(address client,uint value) external nonReentrant{
           sellerDecision(client, value, 2);
    }

     function  sellerDecision(address client,uint value,uint8 sellerChoice) internal nonReentrant{
            bytes32 index = keccak256(abi.encodePacked(client,msg.sender));
            Order[] memory products = activeOrders[index];
            for (uint256 i = 0; i <  products.length; i++) {
                    if(products[i].value==value){
                         require(products[i].client== msg.sender, "You are not the seller.");
                        products[i].sellerDecision=sellerChoice;
                        uint8 decision = checkDecisions(products[i]);
                        if (decision==1){
                            _safeCall(payable(products[i].sellar), products[i].value);
                        }
                        else if (decision==2){
                            _safeCall(payable(products[i].client), products[i].value);
                        }
                        break;
                    }
            }
    }




    function clientProccessTransaction(address seller,uint value) external nonReentrant{
           clientDecision(seller, value, 1);
            
    }

     function clientRevertTransaction(address seller,uint value) external nonReentrant{
           clientDecision(seller, value, 2);
    }

     function  clientDecision(address seller,uint value,uint8 clientChoice) internal nonReentrant{
            bytes32 index = keccak256(abi.encodePacked(msg.sender,seller));
            Order[] memory products = activeOrders[index];
            for (uint256 i = 0; i <  products.length; i++) {
                    if(products[i].value==value){
                         require(products[i].client== msg.sender, "You are not the client.");
                        products[i].clientDecision=clientChoice;
                        uint8 decision = checkDecisions(products[i]);
                        if (decision==1){
                            _safeCall(payable(products[i].sellar), products[i].value);
                        }
                        else if (decision==2){
                            _safeCall(payable(products[i].client), products[i].value);
                        }
                        break;
                    }
            }
    }

    function checkDecisions(Order memory order) internal nonReentrant returns (uint8){
            if(order.clientDecision==order.sellerDecision){
                return order.clientDecision;
            }else{
                return 0;
            }
    }

    function sellerCheckOrders() external view returns(Order[] memory){
        uint count=0;
        bytes32[] memory indexes = sellers[msg.sender];
        for(uint i =0;i< indexes.length;i++){
            count+=activeOrders[indexes[i]].length;
        }
        Order[] memory orders=new Order[](count);
        uint ordersIndex=0;
           for(uint i =0;i< indexes.length;i++){
            Order[] memory currentOrders=activeOrders[indexes[i]];
            for(uint j =0;j<currentOrders.length;j++){
                    orders[ordersIndex]=currentOrders[j];
                    ordersIndex++;
            }
        }
        return orders;


    }

        function clientCheckOrders() external view returns(Order[] memory){
        uint count=0;
        bytes32[] memory indexes = clients[msg.sender];
        for(uint i =0;i< indexes.length;i++){
            count+=activeOrders[indexes[i]].length;
        }
        Order[] memory orders=new Order[](count);
        uint ordersIndex=0;
           for(uint i =0;i< indexes.length;i++){
            Order[] memory currentOrders=activeOrders[indexes[i]];
            for(uint j =0;j<currentOrders.length;j++){
                    orders[ordersIndex]=currentOrders[j];
                    ordersIndex++;
            }
        }
        return orders;
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
           
            Order memory o;
            o.client=msg.sender;
            o.sellar=_addresses[i];
            o.sellerDecision=1;
            o.clientDecision=0;
            o.value=_amounts[i];
            bytes32 index = keccak256(abi.encodePacked(msg.sender,_addresses[i]));
            activeOrders[index].push(o);
            clients[msg.sender].push(index);
            sellers[_addresses[i]].push(index);
        }

        emit MultiTransfer(constTotal, true);
    }
}