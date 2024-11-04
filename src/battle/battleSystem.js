// src/battle/battleSystem.js

export const MAX_HEALTH = 3;

// Initialize health for both Waifus
export const initializeBattleState = () => ({
  yourWaifuHealth: MAX_HEALTH,
  evilWaifuHealth: MAX_HEALTH,
  isYourTurn: true,
  battleOver: false,
  result: null,
});

// Perform an attack action
export const performAttack = (attacker, defenderHealth) => {
  // Reduce the defender's health by 1
  const newHealth = defenderHealth - 1;
  return Math.max(newHealth, 0); // Ensure health doesn't go below 0
};

// Check for battle end conditions
export const checkBattleEnd = (yourWaifuHealth, evilWaifuHealth) => {
  if (evilWaifuHealth <= 0) {
    return { battleOver: true, result: "win" }; // Player wins
  } else if (yourWaifuHealth <= 0) {
    return { battleOver: true, result: "lose" }; // Player loses
  }
  return { battleOver: false, result: null };
};
