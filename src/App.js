// src/App.js
import React, { useState, useEffect } from "react";
import {
  firstNames,
  lastNames,
  titles,
  themes,
  hairColors,
  eyeColors,
  rpgClasses,
  stances,
  outfitStyles,
  outfitDetails,
  accessories,
  auraDescriptions,
  legendaryTraits,
  epicTraits,
  backgroundScenes,
  weaponTypes
} from "./data/traits";

import {
  evilFirstNames,
  evilLastNames,
  evilTitles,
  evilThemes,
  evilHairColors,
  evilEyeColors,
  evilRpgClasses,
  evilStances,
  evilOutfitStyles,
  evilOutfitDetails,
  evilAccessories,
  evilAuraDescriptions,
} from "./data/evilTraits";

function App() {
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [showInventory, setShowInventory] = useState(false);
  const [displayedWaifu, setDisplayedWaifu] = useState(null);
  const [evilWaifu, setEvilWaifu] = useState(null);
  const [showBattle, setShowBattle] = useState(false);
  const [resumeBattleEnabled, setResumeBattleEnabled] = useState(false);
  const [zoomImage, setZoomImage] = useState(null);
  const [newWaifu, setNewWaifu] = useState(null);
  const [showReplacePrompt, setShowReplacePrompt] = useState(false);
  const [showVictoryPrompt, setShowVictoryPrompt] = useState(false);
  const [playerHealth, setPlayerHealth] = useState(3);
  const [enemyHealth, setEnemyHealth] = useState(3);

  useEffect(() => {
    const savedInventory = JSON.parse(localStorage.getItem("inventory")) || [];
    setInventory(savedInventory);

    const savedBattleState = JSON.parse(localStorage.getItem("battleState"));
    if (savedBattleState) {
      setShowBattle(true);
      setResumeBattleEnabled(true);
      setEvilWaifu(savedBattleState.evilWaifu);
    }
  }, []);

  const updateLocalStorageInventory = (newInventory) => {
    localStorage.setItem("inventory", JSON.stringify(newInventory));
  };

  const saveBattleState = (evilWaifu) => {
    localStorage.setItem("battleState", JSON.stringify({ evilWaifu }));
  };

  const clearBattleState = () => {
    localStorage.removeItem("battleState");
  };

  const getRandom = (array) => array[Math.floor(Math.random() * array.length)];

  const generateStarRating = () => {
    const rating = Math.floor(Math.random() * 5) + 1;
    let rarity;
    if (rating === 1) rarity = "Common";
    else if (rating === 2) rarity = "Uncommon";
    else if (rating === 3) rarity = "Rare";
    else if (rating === 4) rarity = "Legendary";
    else rarity = "Epic";
    return { rating, rarity };
  };

  const generateLoreEnding = () => {
    const endings = ["mysterious", "graceful", "ancient", "feared", "enchanting"];
    return `She is ${getRandom(endings)}, ${getRandom(endings)}, and ${getRandom(endings)}.`;
  };

  const generateNameTitle = (isEvil = false) => {
    const firstName = getRandom(isEvil ? evilFirstNames : firstNames);
    const lastName = getRandom(isEvil ? evilLastNames : lastNames);
    const title = getRandom(isEvil ? evilTitles : titles);
    const theme = getRandom(isEvil ? evilThemes : themes);
    return `${firstName} ${lastName}, the ${title} of ${theme}`;
  };

  const generatePrompt = (isEvil = false, specialTrait = null) => {
    
    const hairColor = getRandom(isEvil ? evilHairColors : hairColors);
    const eyeColor = getRandom(isEvil ? evilEyeColors : eyeColors);
    const rpgClass = getRandom(isEvil ? evilRpgClasses : rpgClasses);
    const stance = getRandom(isEvil ? evilStances : stances);
    const outfitStyle = getRandom(isEvil ? evilOutfitStyles : outfitStyles);
    const outfitDetail = getRandom(isEvil ? evilOutfitDetails : outfitDetails);
    const accessory = getRandom(isEvil ? evilAccessories : accessories);
    const auraDescription = getRandom(isEvil ? evilAuraDescriptions : auraDescriptions);
    const background = getRandom(isEvil ? backgroundScenes : backgroundScenes);
    const weapon = getRandom(isEvil ? weaponTypes : weaponTypes);

    let traitDescription = specialTrait ? ` She possesses ${specialTrait}, enhancing her aura of power.` : "";

    return `In a stylized anime look, a ${isEvil ? "sinister" : "graceful"} female ${rpgClass} with ${hairColor} hair, and ${eyeColor} eyes. She stands in ${background}, wielding a ${weapon}. She has a ${stance} stance, wearing ${outfitStyle} that is ${outfitDetail}. She carries ${accessory}, and is surrounded by ${auraDescription}.${traitDescription} The art style is consistent, using vibrant colors, clean lines, and a semi-realistic anime shading that makes her appear as if she's from the same anime series.`;
};

  const generateWaifu = async (isEvil = false, retryCount = 0) => {
    if (retryCount > 3) {
        setError("Failed to generate waifu after multiple attempts due to content moderation.");
        setLoading(false);
        return;
    }

    const { rating, rarity } = generateStarRating();
    const nameTitle = generateNameTitle(isEvil);

    let specialTrait = null;
    if (!isEvil && rarity === "Legendary") specialTrait = getRandom(legendaryTraits);
    else if (!isEvil && rarity === "Epic") specialTrait = getRandom(epicTraits);

    const prompt = generatePrompt(isEvil, specialTrait);
    const loreEnding = generateLoreEnding();
    const rpgClass = getRandom(isEvil ? evilRpgClasses : rpgClasses);
    const accessory = getRandom(accessories);

    setLoading(true);
    setLoadingMessage("Generating your waifu...");
    setError(null);

    try {
        const response = await fetch("http://localhost:5000/api/generate-waifu", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                prompt,
                aspect_ratio: "9:16",
                width: 768,
                height: 1280,
                output_format: "png",
            }),
        });

        const data = await response.json();
        if (data.errors) {
            console.warn("Content moderation triggered:", data.errors);
            // Retry generating a new waifu with a different prompt
            return generateWaifu(isEvil, retryCount + 1);
        }

        const imageBase64 = data.image ? `data:image/png;base64,${data.image}` : null;

        const generatedWaifu = {
            nameTitle,
            prompt,
            lore: `${nameTitle} is a ${rarity} ${rpgClass}. ${loreEnding}`,
            rating,
            rarity,
            rpgClass,
            accessory,
            specialTrait,
            image: imageBase64,
        };

        if (isEvil) {
            setEvilWaifu(generatedWaifu);
            saveBattleState(generatedWaifu);
        } else {
            if (inventory.length >= 1) {
                setNewWaifu(generatedWaifu);
                setShowReplacePrompt(true);
            } else {
                const updatedInventory = [generatedWaifu];
                setDisplayedWaifu(generatedWaifu);
                setInventory(updatedInventory);
                updateLocalStorageInventory(updatedInventory);
            }
        }
    } catch (error) {
        setError("Failed to generate waifu");
    } finally {
        setLoading(false);
    }
};



  const handleReplace = () => {
    const updatedInventory = [newWaifu];
    setInventory(updatedInventory);
    setDisplayedWaifu(newWaifu);
    updateLocalStorageInventory(updatedInventory);
    setShowReplacePrompt(false);
  };

  const startBattle = async () => {
    await generateWaifu(true);
    setShowBattle(true);
    setResumeBattleEnabled(true);
    setShowInventory(false);
  };

  const endBattle = () => {
    setShowBattle(false);
    setResumeBattleEnabled(false);
    setEvilWaifu(null);
    setPlayerHealth(3);
    setEnemyHealth(3);
    clearBattleState();
  };

  const handleResumeBattle = () => {
    setShowBattle(true);
    setShowInventory(false);
  };

  const handleAttack = () => {
    if (enemyHealth > 0) {
      setEnemyHealth((prev) => prev - 1);
      if (enemyHealth - 1 <= 0) {
        setShowVictoryPrompt(true);
        return;
      }
      setTimeout(() => {
        setPlayerHealth((prev) => prev - 1);
        if (playerHealth - 1 <= 0) {
          endBattle();
          alert("You lost the battle.");
        }
      }, 1000);
    }
  };

  const handleVictoryReplace = () => {
    const updatedInventory = [evilWaifu];
    setInventory(updatedInventory);
    setDisplayedWaifu(evilWaifu);
    updateLocalStorageInventory(updatedInventory);
    setShowVictoryPrompt(false);
    endBattle();
  };

  const toggleZoomImage = (image) => {
    setZoomImage(image);
  };

  const handleWaifuClick = (waifu) => {
    setDisplayedWaifu(waifu);
    setShowInventory(false);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h1>Waifu Generator</h1>
      <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
        {!showBattle && (
          <button onClick={() => generateWaifu(false)}>Generate Waifu</button>
        )}
        <button onClick={() => setShowInventory(true)}>View All Waifus</button>
        
        {/* Start Battle button, disabled if no waifu in inventory */}
        {!showBattle && !resumeBattleEnabled && (
          <button 
            onClick={startBattle} 
            disabled={inventory.length === 0}
            title={inventory.length === 0 ? "You need a waifu to start a battle" : ""}
            style={{ opacity: inventory.length === 0 ? 0.5 : 1 }}
          >
            Battle
          </button>
        )}

        {/* Resume Battle button */}
        {resumeBattleEnabled && (
          <button onClick={handleResumeBattle}>Resume Battle</button>
        )}
        
        {/* End Battle button */}
        {showBattle && <button onClick={endBattle}>End Battle</button>}
      </div>

      {loading && <p>{loadingMessage}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {showInventory && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "20px" }}>
          {inventory.map((waifu, index) => (
            <div key={index} onClick={() => handleWaifuClick(waifu)} style={{ cursor: "pointer", margin: "20px 0", textAlign: "center", width: "80%" }}>
              <p><strong>{waifu.nameTitle}</strong></p>
              <img src={waifu.image} alt={waifu.nameTitle} style={{ width: "150px", borderRadius: "8px" }} />
            </div>
          ))}

        </div>
      )}

      {displayedWaifu && !showBattle && (
        <div style={{ marginTop: "20px" }}>
          <h2>{displayedWaifu.nameTitle}</h2>
          <p>{displayedWaifu.lore}</p>
          <p><strong>Rarity:</strong> {displayedWaifu.rarity}</p>
          <p><strong>RPG Class:</strong> {displayedWaifu.rpgClass}</p>
          <p><strong>Accessory:</strong> {displayedWaifu.accessory}</p>
          {displayedWaifu.specialTrait && <p><strong>Special Trait:</strong> {displayedWaifu.specialTrait}</p>}
          <img src={displayedWaifu.image} alt="Displayed Waifu" style={{ maxWidth: "100%", borderRadius: "8px" }} />
        </div>
      )}

      {showBattle && evilWaifu && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
          <div style={{ textAlign: "center", width: "45%" }}>
            <h2>Your Waifu</h2>
            <h3>{inventory[0]?.nameTitle}</h3>
            <img
              src={inventory[0]?.image}
              alt="Your Waifu"
              style={{ maxWidth: "100px", cursor: "pointer", border: "2px solid black", borderRadius: "8px" }}
              onClick={() => toggleZoomImage(inventory[0]?.image)}
            />
            <div style={{ marginTop: "10px" }}>
              <div style={{ width: "100%", height: "20px", backgroundColor: "#ddd" }}>
                <div
                  style={{
                    width: `${(playerHealth / 3) * 100}%`,
                    height: "100%",
                    backgroundColor: "green",
                    textAlign: "center",
                    color: "white",
                  }}
                >
                  {playerHealth} / 3 HP
                </div>
              </div>
            </div>
            <button
              onClick={handleAttack}
              style={{ marginTop: "10px", padding: "10px 20px", fontSize: "16px" }}
            >
              Attack
            </button>
          </div>

          <div style={{ textAlign: "center", width: "45%" }}>
            <h2>Evil Waifu</h2>
            <h3>{evilWaifu.nameTitle}</h3>
            <img
              src={evilWaifu.image}
              alt="Evil Waifu"
              style={{ maxWidth: "100px", cursor: "pointer", border: "2px solid red", borderRadius: "8px" }}
              onClick={() => toggleZoomImage(evilWaifu.image)}
            />
            <div style={{ marginTop: "10px" }}>
              <div style={{ width: "100%", height: "20px", backgroundColor: "#ddd" }}>
                <div
                  style={{
                    width: `${(enemyHealth / 3) * 100}%`,
                    height: "100%",
                    backgroundColor: "red",
                    textAlign: "center",
                    color: "white",
                  }}
                >
                  {enemyHealth} / 3 HP
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showReplacePrompt && newWaifu && (
        <div style={{ position: "fixed", top: "10%", left: "50%", transform: "translate(-50%, 0)", backgroundColor: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)", width: "90%", maxWidth: "400px", maxHeight: "80%", overflowY: "auto" }}>
          <h3>Your inventory is full. Do you want to replace your waifu with the new one?</h3>
          <div style={{ margin: "10px 0" }}>
            <h4>{newWaifu.nameTitle}</h4>
            <p>{newWaifu.lore}</p>
            <p><strong>Rarity:</strong> {newWaifu.rarity}</p>
            <p><strong>RPG Class:</strong> {newWaifu.rpgClass}</p>
            <p><strong>Accessory:</strong> {newWaifu.accessory}</p>
            {newWaifu.specialTrait && <p><strong>Special Trait:</strong> {newWaifu.specialTrait}</p>}
            <img src={newWaifu.image} alt="New Waifu" style={{ maxWidth: "100%", borderRadius: "8px" }} />
          </div>
          <button onClick={handleReplace} style={{ marginTop: "10px", padding: "10px 20px", fontSize: "16px" }}>Replace Waifu</button>
          <button onClick={() => setShowReplacePrompt(false)} style={{ marginTop: "10px", padding: "10px 20px", fontSize: "16px" }}>Cancel</button>
        </div>
      )}

      {showVictoryPrompt && (
        <div style={{ position: "fixed", top: "10%", left: "50%", transform: "translate(-50%, 0)", backgroundColor: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)", width: "90%", maxWidth: "400px", maxHeight: "80%", overflowY: "auto" }}>
          <h3>Victory! Do you want to replace your waifu with the defeated Evil Waifu?</h3>
          <div style={{ margin: "10px 0" }}>
            <h4>{evilWaifu.nameTitle}</h4>
            <p>{evilWaifu.lore}</p>
            <p><strong>Rarity:</strong> {evilWaifu.rarity}</p>
            <p><strong>RPG Class:</strong> {evilWaifu.rpgClass}</p>
            <p><strong>Accessory:</strong> {evilWaifu.accessory}</p>
            {evilWaifu.specialTrait && <p><strong>Special Trait:</strong> {evilWaifu.specialTrait}</p>}
            <img src={evilWaifu.image} alt="Defeated Evil Waifu" style={{ maxWidth: "100%", borderRadius: "8px" }} />
          </div>
          <button onClick={handleVictoryReplace} style={{ marginTop: "10px", padding: "10px 20px", fontSize: "16px" }}>Replace Waifu</button>
          <button onClick={() => { setShowVictoryPrompt(false); endBattle(); }} style={{ marginTop: "10px", padding: "10px 20px", fontSize: "16px" }}>Cancel</button>
        </div>
      )}

      {zoomImage && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0, 0, 0, 0.8)", display: "flex", justifyContent: "center", alignItems: "center" }} onClick={() => setZoomImage(null)}>
          <img src={zoomImage} alt="Zoomed Waifu" style={{ maxWidth: "90%", maxHeight: "90%" }} />
        </div>
      )}
    </div>
  );
}

export default App;
