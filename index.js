import { ethers, BigNumber } from 'ethers';
import  ShopsBulkTransactions from './artifacts/contracts/ShopsBulkTransactions.sol/ShopsBulkTransactions.json';
import * as contractAddresses from './config.js';




function getConfig(blockchain,network){
   
    switch (blockchain){
        case 'avalanche':{
            switch(network){
                case 'testnet':{
                    return {contractAddress: contractAddresses.AVALANCHE_TESTNET, rpcProvider: contractAddresses.AVALANCHE_TESTNET_API};
                }
                default:{throw new Error(`${network} is not supported`);}
            }
            
        }
        case 'polygon':{
            switch(network){
                case 'testnet':{
                    return {contractAddress: contractAddresses.POLYGON_TESTNET, rpcProvider: contractAddresses.POLYGON_TESTNET_API};
                }
                default:{throw new Error(`${network} is not supported`);}
            }
        }
        default:{throw new Error(`${blockchain} is not supported`);}
    }

}

 export async function sendBulkTransaction(blockchain,network,addresses,amounts){
    let config =getConfig(blockchain,network);
    const provider = ethers.getDefaultProvider(config.rpcProvider);
    const contract = new ethers.Contract(config.contractAddress, ShopsBulkTransactions.abi, provider);

    let totalAmount = BigNumber.from(0);
      for (let i = 0; i < amounts.length; i++) {
        totalAmount = totalAmount.add(amounts[i]);
      }


    let tx = await contract.populateTransaction.multiTransfer(addresses,amounts,{value:totalAmount});
    return tx;  
}







