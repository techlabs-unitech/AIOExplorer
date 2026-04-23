// Test script with fixed API calls
const testAddress = "0x1153308107352CEf5cd40a401ce22007693618c5";

// Test Etherscan V2 API
async function testEtherscanV2() {
  console.log("Testing Etherscan V2 API...");
  try {
    const params = new URLSearchParams({
      module: "account",
      action: "txlist",
      address: testAddress,
      startblock: "0",
      endblock: "99999999",
      page: "1",
      offset: "25",
      sort: "desc",
      chainid: "1"
    });
    
    const url = `https://api.etherscan.io/v2/api?${params.toString()}`;
    console.log("URL:", url);
    
    const response = await fetch(url);
    const data = await response.json();
    console.log("Etherscan V2 response:", data);
    
    if (data.status === "1" && data.result.length > 0) {
      console.log(`Found ${data.result.length} transactions`);
      data.result.forEach((tx, i) => {
        console.log(`  ${i+1}. ${tx.hash} - ${tx.value} wei - ${new Date(tx.timeStamp * 1000).toLocaleString()}`);
      });
    } else {
      console.log("No transactions found or API error:", data.message);
    }
  } catch (error) {
    console.error("Etherscan V2 API error:", error);
  }
}

// Test direct RPC call to get transactions from latest block
async function testRPCTransactions() {
  console.log("Testing RPC transactions...");
  try {
    const response = await fetch("https://ethereum.publicnode.com", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getBlockByNumber",
        params: ["latest", true],
        id: 1
      })
    });
    
    const data = await response.json();
    console.log("RPC Block response:", data);
    
    if (data.result && data.result.transactions) {
      const addressTxs = data.result.transactions.filter(tx => 
        tx.to?.toLowerCase() === testAddress.toLowerCase() || 
        tx.from?.toLowerCase() === testAddress.toLowerCase()
      );
      
      console.log(`Found ${addressTxs.length} transactions in latest block`);
      addressTxs.forEach((tx, i) => {
        const value = parseInt(tx.value || "0", 16) / 1e18;
        console.log(`  ${i+1}. ${tx.hash} - ${value} ETH`);
      });
    }
  } catch (error) {
    console.error("RPC error:", error);
  }
}

// Test multiple recent blocks
async function testRecentBlocks() {
  console.log("Testing recent blocks for transactions...");
  try {
    const response = await fetch("https://ethereum.publicnode.com", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_blockNumber",
        params: [],
        id: 1
      })
    });
    
    const data = await response.json();
    const latestBlock = parseInt(data.result, 16);
    console.log(`Latest block: ${latestBlock}`);
    
    let totalTxs = 0;
    for (let i = 0; i < 10; i++) {
      const blockNumber = latestBlock - i;
      const blockResponse = await fetch("https://ethereum.publicnode.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_getBlockByNumber",
          params: [`0x${blockNumber.toString(16)}`, true],
          id: 1
        })
      });
      
      const blockData = await blockResponse.json();
      if (blockData.result?.transactions) {
        const addressTxs = blockData.result.transactions.filter(tx => 
          tx.to?.toLowerCase() === testAddress.toLowerCase() || 
          tx.from?.toLowerCase() === testAddress.toLowerCase()
        );
        
        if (addressTxs.length > 0) {
          console.log(`Block ${blockNumber}: ${addressTxs.length} transactions`);
          addressTxs.forEach(tx => {
            const value = parseInt(tx.value || "0", 16) / 1e18;
            console.log(`  ${tx.hash} - ${value} ETH`);
          });
          totalTxs += addressTxs.length;
        }
      }
    }
    
    console.log(`Total transactions found in last 10 blocks: ${totalTxs}`);
  } catch (error) {
    console.error("Recent blocks error:", error);
  }
}

// Run all tests
async function runTests() {
  await testEtherscanV2();
  console.log("---");
  await testRPCTransactions();
  console.log("---");
  await testRecentBlocks();
}

runTests();
