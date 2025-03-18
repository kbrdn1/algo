/**
 * Function that calculates the optimal change using a greedy algorithm
 * @param amount The amount to give back in cents
 * @returns An object containing the coins used and their quantity
 */
function makeChange(amount: number): Record<number, number> {
  // Available coin values in cents, sorted in descending order
  const coins = [200, 100, 50, 20, 10, 5, 2, 1];
  
  // Object to store the number of coins of each value
  const result: Record<number, number> = {};
  
  // Initialize the result
  coins.forEach(coin => {
    result[coin] = 0;
  });
  
  // Remaining amount to give back
  let remainingAmount = amount;
  
  // Iterate through all available coins
  for (const coin of coins) {
    // Calculate how many coins of this value can be used
    const numCoins = Math.floor(remainingAmount / coin);
    
    if (numCoins > 0) {
      // Add these coins to the result
      result[coin] = numCoins;
      
      // Subtract from the remaining amount
      remainingAmount -= numCoins * coin;
    }
  }
  
  // If we couldn't give back the exact amount, the algorithm failed
  if (remainingAmount > 0) {
    throw new Error(`Unable to make exact change for ${amount} cents with the available coins. Remaining: ${remainingAmount} cents.`);
  }
  
  return result;
}

/**
 * Function to display the result in a readable format
 */
function displayResult(amount: number, coins: Record<number, number>): void {
  console.log(`Change for ${amount/100} euros:`);
  
  let totalCoins = 0;
  
  // Convert values to euros for display
  for (const [coin, count] of Object.entries(coins)) {
    if (count > 0) {
      const coinValue = parseInt(coin);
      const display = coinValue >= 100 
        ? `${coinValue/100} euro${coinValue === 100 ? '' : 's'}` 
        : `${coinValue} cent${coinValue === 1 ? '' : 's'}`;
      
      console.log(`${count} coin${count > 1 ? 's' : ''} of ${display}`);
      totalCoins += count;
    }
  }
  
  console.log(`Total: ${totalCoins} coin${totalCoins > 1 ? 's' : ''}`);
}

// Tests with different amounts
const testAmounts = [42, 167, 999, 53, 8];

for (const amount of testAmounts) {
  try {
    const coins = makeChange(amount);
    displayResult(amount, coins);
    console.log("---------------------------------");
  } catch (error) {
    console.error(error.message);
    console.log("---------------------------------");
  }
}
