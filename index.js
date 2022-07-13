import { ethers, BigNumber, VoidSigner } from 'ethers';
import  ShopsBulkTransactions from './artifacts/contracts/ShopsBulkTransactions.sol/ShopsBulkTransactions.json' ;
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

 export async function sendBulkTransaction(blockchain,network,addresses,amounts,hashes){
    let config =getConfig(blockchain,network);
    const provider = ethers.getDefaultProvider(config.rpcProvider);
    const contract = new ethers.Contract(config.contractAddress, ShopsBulkTransactions.abi, provider);

    let totalAmount = BigNumber.from(0);
      for (let i = 0; i < amounts.length; i++) {
        totalAmount = totalAmount.add(amounts[i]);
      }


    let tx = await contract.populateTransaction.multiTransfer(addresses,amounts,hashes,{value:totalAmount});
    return tx;  
}


export async function clientProccessTransaction(blockchain,network,sellers,values,productHashes){
    let config =getConfig(blockchain,network);
    const provider = ethers.getDefaultProvider(config.rpcProvider);
    const contract = new ethers.Contract(config.contractAddress, ShopsBulkTransactions.abi, provider);

    let tx = await contract.populateTransaction.clientProccessTransaction(sellers,values,productHashes);
    return tx;
}

export async function clientRevertTransaction(blockchain,network,sellers,values,productHashes){
    let config =getConfig(blockchain,network);
    const provider = ethers.getDefaultProvider(config.rpcProvider);
    const contract = new ethers.Contract(config.contractAddress, ShopsBulkTransactions.abi, provider);

    let tx = await contract.populateTransaction.clientRevertTransaction(sellers,values,productHashes);
    return tx;
}

export async function sellerRevertTransaction(blockchain,network,clients,values,productHashes){
    let config =getConfig(blockchain,network);
    const provider = ethers.getDefaultProvider(config.rpcProvider);
    const contract = new ethers.Contract(config.contractAddress, ShopsBulkTransactions.abi, provider);

    let tx = await contract.populateTransaction.sellerRevertTransaction(clients,values,productHashes);
    return tx;
}

export async function sellerProccessTransaction(blockchain,network,clients,values,productHashes){
    let config =getConfig(blockchain,network);
    const provider = ethers.getDefaultProvider(config.rpcProvider);
    const contract = new ethers.Contract(config.contractAddress, ShopsBulkTransactions.abi, provider);
    let tx = await contract.populateTransaction.sellerProccessTransaction(clients,values,productHashes);
    return tx;
}

export async function clientCheckOrders(blockchain,network,address){
    let config =getConfig(blockchain,network);
    const provider = ethers.getDefaultProvider(config.rpcProvider);
    const signer = new VoidSigner(address,provider);
    const contract = new ethers.Contract(config.contractAddress, ShopsBulkTransactions.abi, signer);
    let tx = await contract.clientCheckOrders();
    return tx;
}

export async function clientCheckActiveOrders(blockchain,network,address){
    let config =getConfig(blockchain,network);
    const provider = ethers.getDefaultProvider(config.rpcProvider);
    const signer = new VoidSigner(address,provider);
    const contract = new ethers.Contract(config.contractAddress, ShopsBulkTransactions.abi, signer);
    let tx = await contract.clientCheckActiveOrders();
    return tx;
}

export async function sellerCheckOrders(blockchain,network,address){
    let config =getConfig(blockchain,network);
    const provider = ethers.getDefaultProvider(config.rpcProvider);
    const signer = new VoidSigner(address,provider);
    const contract = new ethers.Contract(config.contractAddress, ShopsBulkTransactions.abi, signer);
    let tx = await contract.sellerCheckOrders();
    return tx;
}


export async function sellerCheckActiveOrders(blockchain,network,address){
    let config =getConfig(blockchain,network);
    const provider = ethers.getDefaultProvider(config.rpcProvider);
    const signer = new VoidSigner(address,provider);
    const contract = new ethers.Contract(config.contractAddress, ShopsBulkTransactions.abi, signer);
    let tx = await contract.sellerCheckActiveOrders();
    return tx;
}


export async function checkProductOrders(blockchain,network,address,seller,productHash){
    let config =getConfig(blockchain,network);
    const provider = ethers.getDefaultProvider(config.rpcProvider);
    const signer = new VoidSigner(address,provider);
    const contract = new ethers.Contract(config.contractAddress, ShopsBulkTransactions.abi, signer);
    let tx = await contract.checkProductOrders(seller,productHash);
    return tx;
}





