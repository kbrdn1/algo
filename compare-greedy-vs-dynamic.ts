/**
 * Greedy algorithm for coin change
 * @param amount The amount to make change for (in cents)
 * @param coins Array of available coin denominations
 * @returns Object with coins used and their count
 */
function coinChangeGreedy(amount: number, coins: number[] = [200, 100, 50, 20, 10, 5, 2, 1]): {
  coinsUsed: Record<number, number>,
  totalCoins: number
} {
  // Sort coins in descending order
  coins.sort((a, b) => b - a);
  
  // Initialize result
  const coinsUsed: Record<number, number> = {};
  coins.forEach(coin => coinsUsed[coin] = 0);
  
  let remainingAmount = amount;
  let totalCoins = 0;
  
  // Greedy approach: always pick the largest coin possible
  for (const coin of coins) {
    const count = Math.floor(remainingAmount / coin);
    if (count > 0) {
      coinsUsed[coin] = count;
      remainingAmount -= coin * count;
      totalCoins += count;
    }
  }
  
  return { coinsUsed, totalCoins };
}

/**
 * Dynamic programming approach for coin change
 * @param amount The amount to make change for (in cents)
 * @param coins Array of available coin denominations
 * @returns Object with the optimal solution details
 */
function coinChangeDP(amount: number, coins: number[] = [200, 100, 50, 20, 10, 5, 2, 1]): {
  coinsUsed: Record<number, number>,
  totalCoins: number
} {
  // Sort coins in descending order
  coins.sort((a, b) => b - a);
  
  // Initialize dp array with Infinity
  const dp: number[] = Array(amount + 1).fill(Infinity);
  
  // Initialize tracking array
  const lastCoin: number[] = Array(amount + 1).fill(-1);
  
  // Base case
  dp[0] = 0;
  
  // Build solution bottom-up
  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (i - coin >= 0 && dp[i - coin] + 1 < dp[i]) {
        dp[i] = dp[i - coin] + 1;
        lastCoin[i] = coin;
      }
    }
  }
  
  // Reconstruct solution
  const coinsUsed: Record<number, number> = {};
  coins.forEach(coin => coinsUsed[coin] = 0);
  
  if (dp[amount] === Infinity) {
    return { coinsUsed, totalCoins: -1 };
  }
  
  let remaining = amount;
  while (remaining > 0) {
    const coin = lastCoin[remaining];
    coinsUsed[coin]++;
    remaining -= coin;
  }
  
  return { coinsUsed, totalCoins: dp[amount] };
}

/**
 * Helper function to display the result and execution time
 */
function displayResult(
  algorithm: string, 
  amount: number, 
  result: { coinsUsed: Record<number, number>, totalCoins: number },
  executionTime: number
): void {
  console.log(`Change for ${amount/100} euros using ${algorithm}:`);
  
  if (result.totalCoins === -1) {
    console.log("No solution found.");
    return;
  }
  
  // Display coins used
  for (const [coin, count] of Object.entries(result.coinsUsed)) {
    if (count > 0) {
      const coinValue = parseInt(coin);
      const display = coinValue >= 100 
        ? `${coinValue/100} euro${coinValue === 100 ? '' : 's'}` 
        : `${coinValue} cent${coinValue === 1 ? '' : 's'}`;
      
      console.log(`${count} coin${count > 1 ? 's' : ''} of ${display}`);
    }
  }
  
  console.log(`Total: ${result.totalCoins} coin${result.totalCoins > 1 ? 's' : ''}`);
  console.log(`Execution time: ${executionTime.toFixed(6)} ms`);
}

/**
 * Function to run and time both algorithms for a given amount
 */
function compareAlgorithms(amount: number): void {
  console.log(`\n----- Amount: ${amount/100} euros (${amount} cents) -----`);
  
  // Measure Greedy algorithm
  const greedyStart = performance.now();
  const greedyResult = coinChangeGreedy(amount);
  const greedyEnd = performance.now();
  const greedyTime = greedyEnd - greedyStart;
  
  // Measure DP algorithm
  const dpStart = performance.now();
  const dpResult = coinChangeDP(amount);
  const dpEnd = performance.now();
  const dpTime = dpEnd - dpStart;
  
  // Display results
  displayResult("Greedy Algorithm", amount, greedyResult, greedyTime);
  console.log("---------------------------------");
  displayResult("Dynamic Programming", amount, dpResult, dpTime);
  
  // Compare the two approaches
  console.log("\nComparison:");
  if (greedyResult.totalCoins === dpResult.totalCoins) {
    console.log("Both algorithms found the same optimal solution.");
  } else {
    console.log(`DP found a solution with ${dpResult.totalCoins} coins, while Greedy used ${greedyResult.totalCoins} coins.`);
  }
  console.log(`Speed difference: DP is ${(dpTime / greedyTime).toFixed(2)}x ${dpTime > greedyTime ? 'slower' : 'faster'} than Greedy.`);
}

// Test with different amounts
const testAmounts = [20, 70, 42, 167, 999, 12345];

// Run multiple times to get more stable timing results
const numRuns = 100;
for (const amount of testAmounts) {
  let greedyTotalTime = 0;
  let dpTotalTime = 0;
  
  // Warm-up runs
  for (let i = 0; i < 10; i++) {
    coinChangeGreedy(amount);
    coinChangeDP(amount);
  }
  
  // Timed runs
  for (let i = 0; i < numRuns; i++) {
    const greedyStart = performance.now();
    coinChangeGreedy(amount);
    greedyTotalTime += performance.now() - greedyStart;
    
    const dpStart = performance.now();
    coinChangeDP(amount);
    dpTotalTime += performance.now() - dpStart;
  }
  
  // Average time per run
  const greedyAvgTime = greedyTotalTime / numRuns;
  const dpAvgTime = dpTotalTime / numRuns;
  
  console.log(`\n----- Amount: ${amount/100} euros (${amount} cents) -----`);
  console.log(`Greedy Algorithm average execution time: ${greedyAvgTime.toFixed(6)} ms`);
  console.log(`Dynamic Programming average execution time: ${dpAvgTime.toFixed(6)} ms`);
  console.log(`Speed ratio: DP is ${(dpAvgTime / greedyAvgTime).toFixed(2)}x ${dpAvgTime > greedyAvgTime ? 'slower' : 'faster'} than Greedy.`);
  
  // Run once with detailed output
  compareAlgorithms(amount);
}
