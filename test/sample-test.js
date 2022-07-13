const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ShopsBulkTransactions", function () {
  let shops;
  beforeEach(async () => {
  const ShopsBulkTransactions = await ethers.getContractFactory("ShopsBulkTransactions");
   shops = await ShopsBulkTransactions.deploy("TEST!");
  await shops.deployed();
});
  it("Should create orders.", async function () {
    const accounts = await ethers.getSigners();
    


    await shops.multiTransfer([accounts[1].address, accounts[2].address],[10,10],["hash1","hash2"],{ value: 20});
    const activeOrders = await shops.clientCheckActiveOrders();
    expect(activeOrders.length).to.equal(2);

  
  });

  it("Should send tokens to seller.", async function () {
    const accounts = await ethers.getSigners();
    const balance1 = await ethers.provider.getBalance(accounts[1].address);
    const balance2 = await ethers.provider.getBalance(accounts[2].address);
    


    await shops.multiTransfer([accounts[1].address, accounts[2].address],[10,10],["hash1","hash2"],{ value: 20});
    await shops.clientProccessTransaction([accounts[1].address],[10],["hash1"]);
    const balance11 = await ethers.provider.getBalance(accounts[1].address);
    const balance21 = await ethers.provider.getBalance(accounts[2].address);
    expect(balance1.add(10)).to.equal(balance11);
    expect(balance2).to.equal(balance21);

  
  });



  it("Should return tokens to client.", async function () {
    const accounts = await ethers.getSigners();
   
    


    await shops.connect(accounts[0]).multiTransfer([accounts[1].address, accounts[2].address],[10,10],["hash1","hash2"],{ value: 20});
    await shops.clientRevertTransaction([accounts[1].address],[10],["hash1"]);
    const balance1 = await ethers.provider.getBalance(accounts[0].address);
    await shops.connect(accounts[1]).sellerRevertTransaction([accounts[0].address],[10],["hash1"]);
    const balance2 = await ethers.provider.getBalance(accounts[0].address);
    expect(balance1.add(10)).to.equal(balance2);
   

  
  });


  it("Should return number of orders.", async function () {
    const accounts = await ethers.getSigners();
    await shops.connect(accounts[0]).multiTransfer([accounts[1].address, accounts[1].address],[10,10],["hash1","hash1"],{ value: 20});
    let orders = await shops.checkProductOrders(accounts[1].address,"hash1");
    expect(orders).to.equal(2);
   

  
  });


  it("Should return number of orders for client.", async function () {
    const accounts = await ethers.getSigners();


    await shops.connect(accounts[0]).multiTransfer([accounts[1].address, accounts[2].address],[10,10],["hash1","hash2"],{ value: 20});
    let activeOrders = await shops.clientCheckActiveOrders();
    expect(activeOrders.length).to.equal(2);
    await shops.connect(accounts[0]).clientProccessTransaction([accounts[1].address],[10],["hash1"]);
    let activeOrders2 = await shops.clientCheckActiveOrders();
    expect(activeOrders2.length).to.equal(1);
    let orders = await shops.clientCheckOrders();
    expect(orders.length).to.equal(2);
   

  
  });

  it("Should return number of orders for seller.", async function () {
    const accounts = await ethers.getSigners();


    await shops.connect(accounts[0]).multiTransfer([accounts[1].address, accounts[2].address],[10,10],["hash1","hash2"],{ value: 20});
    let activeOrders = await shops.connect(accounts[1]).sellerCheckActiveOrders();
    expect(activeOrders.length).to.equal(1);
    await shops.connect(accounts[0]).clientProccessTransaction([accounts[1].address],[10],["hash1"]);
    let activeOrders2 = await shops.connect(accounts[1]).sellerCheckActiveOrders();
    expect(activeOrders2.length).to.equal(0);
    let orders = await shops.connect(accounts[1]).sellerCheckOrders();
    expect(orders.length).to.equal(1);
   

  
  });
});
