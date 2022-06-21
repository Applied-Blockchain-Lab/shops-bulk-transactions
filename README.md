# Shops Bulk Transactions

This library allows you to send bulk Transactions. It uses smart contracts.

## How to use

Install:

```shell
npm Install shops-bulk-transactions

```

Import in project:
```js
import {sendBulkTransaction} from 'shops-bulk-transactions';

```

Use:
```js
//let unsignedTransaction = await sendBulkTransaction('blockchain','network(mainnet,testnet ..)',
//[array with addresses],[array with ammounts]));
//Example:

let unsignedTransaction = await sendBulkTransaction('avalanche','testnet',

['0xb6F32C6d8C23e5201Ec123644f11cf6F013d9363','0xb6F32C6d8C23e5201Ec123644f11

cf6F013d9363'],[100,100]));
//You need to sign and send the transaction after this.
```



