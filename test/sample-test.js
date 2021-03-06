const { expect } = require("chai");
const { ethers } = require("hardhat");
const helpers = require("@nomicfoundation/hardhat-network-helpers");

describe("ShopsBulkTransactions", function () {
  let accounts;
  let shops;
  beforeEach(async () => {
    accounts = await ethers.getSigners();
    const ShopsBulkTransactions = await ethers.getContractFactory(
      "ShopsBulkTransactions"
    );
    shops = await ShopsBulkTransactions.deploy("TEST!", accounts[9].address);
    await shops.deployed();
  });
  it("Should create orders.", async function () {
    await shops.multiTransfer(
      [accounts[1].address, accounts[2].address],
      [10, 10],
      ["hash1", "hash2"],
      "webId",
      { value: 20 }
    );
    const activeOrders = await shops.clientCheckActiveOrders();
    expect(activeOrders.length).to.equal(2);
  });
  it("Should not create orders.", async function () {
    await expect(
      shops.multiTransfer(
        [accounts[2].address],
        [10, 10],
        ["hash1", "hash2"],
        "webId",
        { value: 20 }
      )
    ).to.be.revertedWith("Addresses length must be equal to amounts length");
  });
  it("Should not create orders if no tokens are send.", async function () {
    await expect(
      shops.multiTransfer(
        [accounts[1].address, accounts[2].address],
        [10, 10],
        ["hash1", "hash2"],
        "webId",
        { value: 0 }
      )
    ).to.be.revertedWith("Total amount is less than current send amount");
  });

  it("Should send tokens to seller when both parties confirm", async function () {
    const balance2 = await ethers.provider.getBalance(accounts[2].address);

    await shops.multiTransfer(
      [accounts[1].address, accounts[2].address],
      [10, 10],
      ["hash1", "hash2"],
      "webId",
      { value: 20 }
    );

    // Seller 1 confirms with shop account
    const sellerOrders = await shops
      .connect(accounts[1])
      .sellerCheckActiveOrders();
    await shops
      .connect(accounts[1])
      .sellerProccessTransaction(
        [accounts[0].address],
        [sellerOrders[0].orderHash]
      );

    const balance1 = await ethers.provider.getBalance(accounts[1].address);

    // Client confirms
    const orders = await shops.clientCheckActiveOrders();
    await shops.clientProccessTransaction(
      [accounts[1].address],
      [orders[0].orderHash]
    );
    const balance11 = await ethers.provider.getBalance(accounts[1].address);
    const balance21 = await ethers.provider.getBalance(accounts[2].address);

    expect(balance1.add(10)).to.equal(balance11);
    expect(balance2).to.equal(balance21);
  });

  it("Should send tokens to seller only once.", async function () {
    const balance2 = await ethers.provider.getBalance(accounts[2].address);

    await shops.multiTransfer(
      [accounts[1].address, accounts[2].address],
      [10, 10],
      ["hash1", "hash2"],
      "webId",
      { value: 20 }
    );

    // Seller 1 confirms with shop account
    const sellerOrders = await shops
      .connect(accounts[1])
      .sellerCheckActiveOrders();
    await shops
      .connect(accounts[1])
      .sellerProccessTransaction(
        [accounts[0].address],
        [sellerOrders[0].orderHash]
      );

    const balance1 = await ethers.provider.getBalance(accounts[1].address);

    const orders = await shops.clientCheckActiveOrders();
    await shops.clientProccessTransaction(
      [accounts[1].address],
      [orders[0].orderHash]
    );

    const balance11 = await ethers.provider.getBalance(accounts[1].address);
    const balance21 = await ethers.provider.getBalance(accounts[2].address);

    expect(balance1.add(10)).to.equal(balance11);
    expect(balance2).to.equal(balance21);

    const balance3 = await ethers.provider.getBalance(shops.address);

    await shops.clientProccessTransaction(
      [accounts[1].address],
      [orders[0].orderHash]
    );

    const balance31 = await ethers.provider.getBalance(shops.address);
    expect(balance3).to.equal(balance31);
  });

  it("Should return tokens to client.", async function () {
    await shops
      .connect(accounts[0])
      .multiTransfer(
        [accounts[1].address, accounts[2].address],
        [10, 10],
        ["hash1", "hash2"],
        "webId",
        { value: 20 }
      );
    const orders = await shops.clientCheckActiveOrders();
    await shops.clientRevertTransaction(
      [accounts[1].address],
      [orders[0].orderHash]
    );
    const balance1 = await ethers.provider.getBalance(accounts[0].address);
    const orders2 = await shops.connect(accounts[1]).sellerCheckActiveOrders();
    await shops
      .connect(accounts[1])
      .sellerRevertTransaction([accounts[0].address], [orders2[0].orderHash]);
    const balance2 = await ethers.provider.getBalance(accounts[0].address);
    expect(balance1.add(10)).to.equal(balance2);
  });

  it("Should not let someone else claim the tokens.", async function () {
    await shops
      .connect(accounts[0])
      .multiTransfer(
        [accounts[1].address, accounts[2].address],
        [10, 10],
        ["hash1", "hash2"],
        "webId",
        { value: 20 }
      );
    const balance1 = await ethers.provider.getBalance(shops.address);
    const orders = await shops.connect(accounts[0]).clientCheckActiveOrders();

    await shops
      .connect(accounts[1])
      .clientRevertTransaction([accounts[1].address], [orders[0].orderHash]);
    const balance2 = await ethers.provider.getBalance(shops.address);
    expect(balance1).to.equal(balance2);
  });

  it("Wrong parameters.", async function () {
    await shops
      .connect(accounts[0])
      .multiTransfer(
        [accounts[1].address, accounts[2].address],
        [10, 10],
        ["hash1", "hash2"],
        "webId",
        { value: 20 }
      );

    const orders = await shops.connect(accounts[0]).clientCheckActiveOrders();

    await expect(
      shops
        .connect(accounts[0])
        .clientRevertTransaction([], [orders[0].orderHash])
    ).to.be.revertedWith(
      "Addresses length must be equal to order hashes length."
    );
  });
  it("Wrong parameters.", async function () {
    await shops
      .connect(accounts[0])
      .multiTransfer(
        [accounts[1].address, accounts[2].address],
        [10, 10],
        ["hash1", "hash2"],
        "webId",
        { value: 20 }
      );

    await expect(
      shops.connect(accounts[0]).clientRevertTransaction([], [])
    ).to.be.revertedWith("No parameters.");
  });

  it("Wrong parameters.", async function () {
    await shops
      .connect(accounts[0])
      .multiTransfer(
        [accounts[1].address, accounts[2].address],
        [10, 10],
        ["hash1", "hash2"],
        "webId",
        { value: 20 }
      );

    const orders = await shops.connect(accounts[0]).clientCheckActiveOrders();

    await expect(
      shops
        .connect(accounts[0])
        .clientProccessTransaction([], [orders[0].orderHash])
    ).to.be.revertedWith(
      "Addresses length must be equal to order hashes length."
    );
  });
  it("Wrong parameters.", async function () {
    await shops
      .connect(accounts[0])
      .multiTransfer(
        [accounts[1].address, accounts[2].address],
        [10, 10],
        ["hash1", "hash2"],
        "webId",
        { value: 20 }
      );

    await expect(
      shops.connect(accounts[0]).clientProccessTransaction([], [])
    ).to.be.revertedWith("No parameters.");
  });

  it("Should return tokens to client.", async function () {
    await shops
      .connect(accounts[0])
      .multiTransfer(
        [accounts[1].address, accounts[2].address],
        [10, 10],
        ["hash1", "hash2"],
        "webId",
        { value: 20 }
      );
    const orders = await shops.connect(accounts[1]).sellerCheckActiveOrders();
    await shops
      .connect(accounts[1])
      .sellerRevertTransaction([accounts[0].address], [orders[0].orderHash]);
    const balance1 = await ethers.provider.getBalance(shops.address);
    const orders2 = await shops.clientCheckActiveOrders();
    await shops.clientRevertTransaction(
      [accounts[1].address],
      [orders2[0].orderHash]
    );
    const balance2 = await ethers.provider.getBalance(shops.address);
    expect(balance1).to.equal(balance2.add(10));
  });

  it("Should send tokens to seller.", async function () {
    await shops
      .connect(accounts[0])
      .multiTransfer(
        [accounts[1].address, accounts[2].address],
        [10, 10],
        ["hash1", "hash2"],
        "webId",
        { value: 20 }
      );
    const orders = await shops.connect(accounts[1]).sellerCheckActiveOrders();
    await shops
      .connect(accounts[1])
      .sellerRevertTransaction([accounts[0].address], [orders[0].orderHash]);
    const balance1 = await ethers.provider.getBalance(shops.address);
    const orders2 = await shops.clientCheckActiveOrders();
    await shops.clientProccessTransaction(
      [accounts[1].address],
      [orders2[0].orderHash]
    );
    const orders3 = await shops.connect(accounts[1]).sellerCheckActiveOrders();
    await shops
      .connect(accounts[1])
      .sellerProccessTransaction([accounts[0].address], [orders3[0].orderHash]);
    const balance2 = await ethers.provider.getBalance(shops.address);
    expect(balance1).to.equal(balance2.add(10));
  });

  it("Should return number of orders.", async function () {
    await shops
      .connect(accounts[0])
      .multiTransfer(
        [accounts[1].address, accounts[1].address, accounts[1].address],
        [10, 10, 10],
        ["hash1", "hash1", "hash2"],
        "webId",
        { value: 30 }
      );
    const orders = await shops.checkProductOrders(accounts[1].address, "hash1");
    expect(orders).to.equal(2);
  });

  it("Should return number of orders for client.", async function () {
    await shops
      .connect(accounts[0])
      .multiTransfer(
        [accounts[1].address, accounts[2].address],
        [10, 10],
        ["hash1", "hash2"],
        "webId",
        { value: 20 }
      );

    const activeOrders = await shops.clientCheckActiveOrders();
    expect(activeOrders.length).to.equal(2);

    await shops
      .connect(accounts[0])
      .clientProccessTransaction(
        [accounts[1].address],
        [activeOrders[0].orderHash]
      );

    const activeOrders2 = await shops.clientCheckActiveOrders();
    expect(activeOrders2.length).to.equal(2);

    const orders = await shops.clientCheckOrders();
    expect(orders.length).to.equal(2);
  });

  it("Should return number of orders for seller.", async function () {
    await shops
      .connect(accounts[0])
      .multiTransfer(
        [accounts[1].address, accounts[2].address],
        [10, 10],
        ["hash1", "hash2"],
        "webId",
        { value: 20 }
      );

    const activeOrders = await shops
      .connect(accounts[1])
      .sellerCheckActiveOrders();
    expect(activeOrders.length).to.equal(1);

    await shops
      .connect(accounts[0])
      .clientProccessTransaction(
        [accounts[1].address],
        [activeOrders[0].orderHash]
      );

    const activeOrders2 = await shops
      .connect(accounts[1])
      .sellerCheckActiveOrders();
    expect(activeOrders2.length).to.equal(1);

    const orders = await shops.connect(accounts[1]).sellerCheckOrders();
    expect(orders.length).to.equal(1);
  });

  it("Should not let seller take the tokens.", async function () {
    await shops
      .connect(accounts[0])
      .multiTransfer(
        [accounts[1].address, accounts[2].address],
        [100000000000000, 10],
        ["hash1", "hash2"],
        "webId",
        { value: 100000000000010 }
      );
    const balance1 = await ethers.provider.getBalance(shops.address);
    const orders = await shops.connect(accounts[1]).sellerCheckActiveOrders();
    await shops
      .connect(accounts[1])
      .sellerProccessTransaction([accounts[0].address], [orders[0].orderHash]);
    const balance2 = await ethers.provider.getBalance(shops.address);
    expect(Number(balance1)).to.equal(Number(balance2));
  });

  it("Should let seller take the tokens.", async function () {
    await shops
      .connect(accounts[0])
      .multiTransfer(
        [accounts[1].address, accounts[2].address],
        [100000000000000, 10],
        ["hash1", "hash2"],
        "webId",
        { value: 100000000000010 }
      );

    await helpers.time.increaseTo(
      (await helpers.time.latest()) + 32 * 24 * 60 * 60
    );

    const balance1 = await ethers.provider.getBalance(accounts[1].address);
    const orders = await shops.connect(accounts[1]).sellerCheckActiveOrders();
    await shops
      .connect(accounts[1])
      .sellerProccessTransaction([accounts[0].address], [orders[0].orderHash]);

    const balance2 = await ethers.provider.getBalance(accounts[1].address);

    expect(Number(balance1)).to.lessThan(Number(balance2));
  });

  it("Should not let seller take the tokens more than once.", async function () {
    await shops
      .connect(accounts[0])
      .multiTransfer(
        [accounts[1].address, accounts[2].address],
        [100000000000000, 10],
        ["hash1", "hash2"],
        "webId",
        { value: 100000000000010 }
      );

    await helpers.time.increaseTo(
      (await helpers.time.latest()) + 32 * 24 * 60 * 60
    );

    const balance1 = await ethers.provider.getBalance(accounts[1].address);
    const orders = await shops.connect(accounts[1]).sellerCheckActiveOrders();
    await shops
      .connect(accounts[1])
      .sellerProccessTransaction([accounts[0].address], [orders[0].orderHash]);

    const balance2 = await ethers.provider.getBalance(accounts[1].address);

    expect(Number(balance1)).to.lessThan(Number(balance2));

    const balance21 = await ethers.provider.getBalance(shops.address);
    await shops
      .connect(accounts[1])
      .sellerProccessTransaction([accounts[0].address], [orders[0].orderHash]);
    const balance22 = await ethers.provider.getBalance(shops.address);
    expect(Number(balance21)).to.be.equal(Number(balance22));
  });

  it("Should return tokens to client after arbitrator vote.", async function () {
    await shops
      .connect(accounts[0])
      .multiTransfer(
        [accounts[1].address, accounts[2].address],
        [10, 10],
        ["hash1", "hash2"],
        "webId",
        { value: 20 }
      );
    const orders = await shops.clientCheckActiveOrders();
    await shops.clientRevertTransaction(
      [accounts[1].address],
      [orders[0].orderHash]
    );
    const balance1 = await ethers.provider.getBalance(accounts[0].address);
    const orders2 = await shops.clientCheckActiveOrders();
    await shops
      .connect(accounts[9])
      .arbitratorRevertTransaction(
        [accounts[0].address],
        [accounts[1].address],
        [orders2[0].orderHash]
      );
    const balance2 = await ethers.provider.getBalance(accounts[0].address);
    expect(balance1.add(10)).to.equal(balance2);
  });

  it("Should send tokens to seller after arbitrator vote.", async function () {
    await shops
      .connect(accounts[0])
      .multiTransfer(
        [accounts[1].address, accounts[2].address],
        [10, 10],
        ["hash1", "hash2"],
        "webId",
        { value: 20 }
      );

    // Seller 1 confirms with shop account
    const sellerOrders = await shops
      .connect(accounts[1])
      .sellerCheckActiveOrders();
    await shops
      .connect(accounts[1])
      .sellerProccessTransaction(
        [accounts[0].address],
        [sellerOrders[0].orderHash]
      );

    const balance1 = await ethers.provider.getBalance(accounts[1].address);

    const orders = await shops.clientCheckActiveOrders();

    await shops.clientRevertTransaction(
      [accounts[1].address],
      [orders[0].orderHash]
    );

    const orders2 = await shops.clientCheckActiveOrders();

    await shops
      .connect(accounts[9])
      .arbitratorProccessTransaction(
        [accounts[0].address],
        [accounts[1].address],
        [orders2[0].orderHash]
      );

    const balance2 = await ethers.provider.getBalance(accounts[1].address);
    expect(balance1.add(10)).to.equal(balance2);
  });

  it("Should not let wrong arbitrator to vote.", async function () {
    await shops
      .connect(accounts[0])
      .multiTransfer(
        [accounts[1].address, accounts[2].address],
        [10, 10],
        ["hash1", "hash2"],
        "webId",
        { value: 20 }
      );
    const orders = await shops.clientCheckActiveOrders();
    await shops.clientRevertTransaction(
      [accounts[1].address],
      [orders[0].orderHash]
    );
    const orders2 = await shops.clientCheckActiveOrders();
    await expect(
      shops
        .connect(accounts[0])
        .arbitratorProccessTransaction(
          [accounts[0].address],
          [accounts[1].address],
          [orders2[0].orderHash]
        )
    ).to.be.revertedWith("You are not the arbitrator.");
  });
});
