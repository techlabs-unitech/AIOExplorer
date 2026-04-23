// Test script to debug API issues
const testAddress = "0x1153308107352CEf5cd40a401ce22007693618c5";

// Test Etherscan API directly
async function testEtherscanAPI() {
  console.log("Testing Etherscan API...");
  try {
    const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${testAddress}&startblock=0&endblock=99999999&page=1&offset=25&sort=desc&apikey=YourApiKeyToken`;
    const response = await fetch(url);
    const data = await response.json();
    console.log("Etherscan response:", data);
    if (data.status === "1" && data.result.length > 0) {
      console.log(`Found ${data.result.length} transactions`);
    } else {
      console.log("No transactions found or API error:", data.message);
    }
  } catch (error) {
    console.error("Etherscan API error:", error);
  }
}

// Test Ankr API
async function testAnkrAPI() {
  console.log("Testing Ankr API...");
  try {
    const response = await fetch("https://rpc.ankr.com/multichain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "ankr_getTransactionsByAddress",
        params: {
          blockchain: "eth",
          address: testAddress,
          pageSize: 25,
          descOrder: true,
          includeLogs: false
        },
        id: 1
      })
    });
    const data = await response.json();
    console.log("Ankr response:", data);
    if (data.result?.transactions?.length > 0) {
      console.log(`Found ${data.result.transactions.length} transactions via Ankr`);
    } else {
      console.log("No transactions found via Ankr");
    }
  } catch (error) {
    console.error("Ankr API error:", error);
  }
}

// Test NFT API
async function testNFTAPI() {
  console.log("Testing NFT API...");
  try {
    const response = await fetch("https://rpc.ankr.com/multichain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "ankr_getNFTsByOwner",
        params: {
          blockchain: "eth",
          walletAddress: testAddress,
          pageSize: 24
        },
        id: 1
      })
    });
    const data = await response.json();
    console.log("NFT response:", data);
    if (data.result?.assets?.length > 0) {
      console.log(`Found ${data.result.assets.length} NFTs via Ankr`);
    } else {
      console.log("No NFTs found via Ankr");
    }
  } catch (error) {
    console.error("NFT API error:", error);
  }
}

// Run all tests
async function runTests() {
  await testEtherscanAPI();
  console.log("---");
  await testAnkrAPI();
  console.log("---");
  await testNFTAPI();
}

runTests();
