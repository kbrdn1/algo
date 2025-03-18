/**
 * Solves the coin change problem using dynamic programming
 * @param amount The amount to make change for (in cents)
 * @param coins Array of available coin denominations
 * @returns An object with the optimal solution details
 */
function coinChangeDP(amount: number, coins: number[] = [200, 100, 50, 20, 10, 5, 2, 1]): {
  minCoins: number,
  coinsUsed: Record<number, number>
} {
  // Sort coins in descending order
  coins.sort((a, b) => b - a);
  
  // Initialize dp array with Infinity (representing "no solution yet")
  // dp[i] will represent the minimum number of coins needed for amount i
  const dp: number[] = Array(amount + 1).fill(Infinity);
  
  // Initialize tracking array to store which coin was used for each amount
  const lastCoin: number[] = Array(amount + 1).fill(-1);
  
  // Base case: 0 coins needed to make change for 0 cents
  dp[0] = 0;
  
  // Build the solution from bottom up
  for (let i = 1; i <= amount; i++) {
    // Try each coin
    for (const coin of coins) {
      // If the coin value is less than or equal to the current amount
      // and using this coin gives a better solution
      if (i - coin >= 0 && dp[i - coin] + 1 < dp[i]) {
        dp[i] = dp[i - coin] + 1;  // Update minimum coins needed
        lastCoin[i] = coin;        // Track which coin was used
      }
    }
  }
  
  // Reconstruct the solution (which coins were used)
  const coinsUsed: Record<number, number> = {};
  coins.forEach(coin => coinsUsed[coin] = 0);
  
  // If no solution exists
  if (dp[amount] === Infinity) {
    return { minCoins: -1, coinsUsed };
  }
  
  // Trace back to count which coins were used
  let remaining = amount;
  while (remaining > 0) {
    const coin = lastCoin[remaining];
    coinsUsed[coin]++;
    remaining -= coin;
  }
  
  return {
    minCoins: dp[amount],
    coinsUsed
  };
}

/**
 * Helper function to display the result
 */
function displayDPResult(amount: number, result: { minCoins: number, coinsUsed: Record<number, number> }): void {
  console.log(`Change for ${amount/100} euros using dynamic programming:`);
  
  if (result.minCoins === -1) {
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
  
  console.log(`Total: ${result.minCoins} coin${result.minCoins > 1 ? 's' : ''}`);
  
  // Display memory usage
  const memoryUsed = (amount + 1) * 8; // Rough estimate: 2 arrays of size (amount+1) * 4 bytes
  console.log(`Memory used for dp arrays: ~${memoryUsed} bytes`);
}

// Test with the requested amounts
const testAmounts = [20, 70, 42, 167, 999];

for (const amount of testAmounts) {
  console.log("\n---------------------------------");
  const result = coinChangeDP(amount);
  displayDPResult(amount, result);
  
  // Optional: Display intermediate dp array for small amounts to show memoization
  if (amount <= 20) {
    console.log("\nIntermediate calculations (for educational purposes):");
    // We would need to modify the function to return the dp array
    // but for brevity, I'll just explain the concept
    console.log("For each amount from 0 to 20, we store the minimum number of coins needed.");
    console.log("This allows us to reuse previous calculations when solving larger amounts.");
  }
}
