# Shops Bulk Transactions

This library allows you to send bulk transactions to shops using escrow mechanism. It uses smart contracts. The tokens are released when the client confirms, that he got the product. If there is no agreement between the client and the seller, the arbitrator decides the case.

## Blockchains
-  Avalanche testnet
-  Polygon testnet

## How to use

Install:

```shell
npm install shops-bulk-transactions

```


Bulk transacttion:

```js
import { sendBulkTransaction } from "shops-bulk-transactions";
//let unsignedTransaction = await sendBulkTransaction('blockchain','network(mainnet,testnet ..)',
//[array with addresses],[array with ammounts],clientInfo(solid webid) ));
//Example:

let unsignedTransaction = await sendBulkTransaction('avalanche','testnet',

['0xb6F32C6d8C23e5201Ec123644f11cf6F013d9363','0xb6F32C6d8C23e5201Ec123644f11

cf6F013d9363'],[100,100],"https://example.pod.provider/profile/card#me"));
//You need to sign and send the transaction after this.
```


Check active orders for client: 
```js
import { clientCheckActiveOrders } from "shops-bulk-transactions";

let orders = await clientCheckActiveOrders(blockchain, network, clientAddress);
```

Confirm from client:
```js
import { clientProccessTransaction } from "shops-bulk-transactions";
//let unsignedTransaction = await clientProccessTransaction('blockchain','network(mainnet,testnet ..)',
//[array with addresses],
//[array with order hashes](Take them from clientCheckActiveOrders) 
//));

 let transaction = await clientProccessTransaction(
        blockchain,
        network,
        sellers,
        productHashes
      );
//You need to sign and send the transaction after this.
```

Request refund from client:
```js
import { clientRevertTransaction } from "shops-bulk-transactions";
//let unsignedTransaction = await clientRevertTransaction('blockchain','network(mainnet,testnet ..)',
//[array with addresses],
//[array with order hashes](Take them from clientCheckActiveOrders) 
//));

 let transaction = await clientRevertTransaction(
        blockchain,
        network,
        sellers,
        productHashes
      );
//You need to sign and send the transaction after this.
```

Check active orders for seller:
```js
import {  sellerCheckActiveOrders } from "shops-bulk-transactions";

  let orders = await sellerCheckActiveOrders(
       blockchain,
        network,
        sellerAddress
      );

```

Confirm from seller:
```js
import { sellerProccessTransaction } from "shops-bulk-transactions";
//let unsignedTransaction = await sellerProccessTransaction('blockchain','network(mainnet,testnet ..)',
//[array with addresses],
//[array with order hashes](Take them from sellerCheckActiveOrders) 
//));

 let transaction = await sellerProccessTransaction(
        blockchain,
        network,
        clients,
        productHashes
      );
//You need to sign and send the transaction after this.
```

Refund from seller:
```js
import { sellerRevertTransaction } from "shops-bulk-transactions";
//let unsignedTransaction = await sellerRevertTransaction('blockchain','network(mainnet,testnet ..)',
//[array with addresses],
//[array with order hashes](Take them from sellerCheckActiveOrders) 
//));

 let transaction = await sellerRevertTransaction(
        blockchain,
        network,
        clients,
        productHashes
      );
//You need to sign and send the transaction after this.
```
