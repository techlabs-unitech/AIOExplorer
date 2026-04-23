// Test with a known active address
const activeAddress = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"; // Vitalik's address - very active

// Test public API without key requirements
async function testPublicAPI() {
  console.log("Testing public API with active address...");
  try {
    // Use a public API that doesn't require keys
    const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${activeAddress}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc`;
    console.log("URL:", url);
    
    const response = await fetch(url);
    const data = await response.json();
    console.log("Public API response:", data);
    
    if (data.status === "1" && data.result.length > 0) {
      console.log(`Found ${data.result.length} transactions for active address`);
      data.result.slice(0, 3).forEach((tx, i) => {
        const value = parseInt(tx.value || "0") / 1e18;
        console.log(`  ${i+1}. ${tx.hash} - ${value} ETH - ${new Date(tx.timeStamp * 1000).toLocaleString()}`);
      });
    } else {
      console.log("No transactions found or API error:", data.message);
    }
  } catch (error) {
    console.error("Public API error:", error);
  }
}

// Test RPC with active address
async function testRPCActive() {
  console.log("Testing RPC with active address...");
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
    
    if (data.result && data.result.transactions) {
      const addressTxs = data.result.transactions.filter(tx => 
        tx.to?.toLowerCase() === activeAddress.toLowerCase() || 
        tx.from?.toLowerCase() === activeAddress.toLowerCase()
      );
      
      console.log(`Found ${addressTxs.length} transactions in latest block for active address`);
      addressTxs.forEach((tx, i) => {
        const value = parseInt(tx.value || "0", 16) / 1e18;
        console.log(`  ${i+1}. ${tx.hash} - ${value} ETH`);
      });
    }
  } catch (error) {
    console.error("RPC error:", error);
  }
}

// Test the original address to confirm it has no transactions
async function testOriginalAddress() {
  console.log("Testing original address to confirm no transactions...");
  try {
    const url = `https://api.etherscan.io/api?module=account&action=txlist&address=0x1153308107352CEf5cd40a401ce22007693618c5&startblock=0&endblock=99999999&page=1&offset=5&sort=desc`;
    
    const response = await fetch(url);
    const data = await response.json();
    console.log("Original address response:", data);
    
    if (data.status === "1" && data.result.length > 0) {
      console.log(`Found ${data.result.length} transactions for original address`);
    } else {
      console.log("Confirmed: No transactions found for original address");
    }
  } catch (error) {
    console.error("Original address test error:", error);
  }
}

// Run all tests
async function runTests() {
  await testPublicAPI();
  console.log("---");
  await testRPCActive();
  console.log("---");
  await testOriginalAddress();
}

runTests();
