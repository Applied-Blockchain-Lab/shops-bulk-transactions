import { ethers, BigNumber } from 'ethers';
import  ShopsBulkTransactions from './artifacts/contracts/ShopsBulkTransactions.sol/ShopsBulkTransactions.json' assert {type: "json"};
import * as contractAddresses from './config.js';




function getConfig(blockchain,network){
   
    switch (blockchain){
        case 'avalanche':{
            switch(network){
                case 'testnet':{
                    return {contractAddress: contractAddresses.AVALANCHE_TESTNET, rpcProvider: contractAddresses.AVALANCHE_TESTNET_API};
                }
                
            }
            
        }
        case 'polygon':{
            switch(network){
                case 'testnet':{
                    return {contractAddress: contractAddresses.POLYGON_TESTNET, rpcProvider: contractAddresses.POLYGON_TESTNET_API};
                }
               
            }
        }
        
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


export async function clientProccessTransaction(blockchain,network,seller,value){
    let config =getConfig(blockchain,network);
    const provider = ethers.getDefaultProvider(config.rpcProvider);
    const contract = new ethers.Contract(config.contractAddress, ShopsBulkTransactions.abi, provider);

    let tx = await contract.populateTransaction.clientProccessTransaction(seller,value);
    return tx;
}

export async function clientRevertTransaction(blockchain,network,seller,value){
    let config =getConfig(blockchain,network);
    const provider = ethers.getDefaultProvider(config.rpcProvider);
    const contract = new ethers.Contract(config.contractAddress, ShopsBulkTransactions.abi, provider);

    let tx = await contract.populateTransaction.clientRevertTransaction(seller,value);
    return tx;
}

export async function sellerRevertTransaction(blockchain,network,client,value){
    let config =getConfig(blockchain,network);
    const provider = ethers.getDefaultProvider(config.rpcProvider);
    const contract = new ethers.Contract(config.contractAddress, ShopsBulkTransactions.abi, provider);

    let tx = await contract.populateTransaction.sellerRevertTransaction(client,value);
    return tx;
}

export async function sellerProccessTransaction(blockchain,network,client,value){
    let config =getConfig(blockchain,network);
    const provider = ethers.getDefaultProvider(config.rpcProvider);
    const contract = new ethers.Contract(config.contractAddress, ShopsBulkTransactions.abi, provider);
    let tx = await contract.populateTransaction.sellerProccessTransaction(client,value);
    return tx;
}

export async function clientCheckOrders(blockchain,network,address){
    let config =getConfig(blockchain,network);
    const provider = ethers.getDefaultProvider(config.rpcProvider);
    const contract = new ethers.Contract(config.contractAddress, ShopsBulkTransactions.abi, provider);
    let tx = await contract.clientCheckOrders(address);
    return tx;
}

export async function sellerCheckOrders(blockchain,network,address){
    let config =getConfig(blockchain,network);
    const provider = ethers.getDefaultProvider(config.rpcProvider);
    const contract = new ethers.Contract(config.contractAddress, ShopsBulkTransactions.abi, provider);
    let tx = await contract.sellerCheckOrders(address);
    return tx;
}





