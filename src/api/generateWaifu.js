// src/api/generateWaifu.js

export async function generateWaifu() {
    const traits = {
      hairColor: ['black', 'blonde', 'red', 'blue'],
      eyeColor: ['blue', 'green', 'brown', 'amber'],
      rpgClass: ['black mage', 'white mage', 'paladin', 'knight', 'assassin']
    };
  
    function getRandomTrait(traitArray) {
      return traitArray[Math.floor(Math.random() * traitArray.length)];
    }
  
    const hairColor = getRandomTrait(traits.hairColor);
    const eyeColor = getRandomTrait(traits.eyeColor);
    const rpgClass = getRandomTrait(traits.rpgClass);
  
    const prompt = `In a detailed anime-inspired, semi-realistic art style, a ${rpgClass} with ${hairColor} hair and ${eyeColor} eyes stands confidently. She wears ${rpgClass}-appropriate clothing, showcasing intricate details and enchantments, on a clean white or light gray background.`;
  
    try {
      // Make request to the local server at http://localhost:5000 instead of Stability AI directly
      const response = await fetch("http://localhost:5000/api/generate-waifu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt,
          width: 512,
          height: 512,
          steps: 30
        })
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response from proxy server:", errorText);
        throw new Error(`Failed to fetch character: ${errorText}`);
      }
  
      const data = await response.json();
      if (!data || !data.artifacts || !data.artifacts[0].base64) {
        throw new Error("API response does not contain expected image data.");
      }
  
      return data.artifacts[0].base64;
    } catch (error) {
      console.error("Error in generateWaifu:", error);
      throw error;
    }
  }
  