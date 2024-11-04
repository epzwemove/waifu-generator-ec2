// src/components/WaifuDisplay.js
import React from 'react';

function WaifuDisplay({ imageUrl }) {
  return (
    <div className="waifu-display">
      {imageUrl ? <img src={`data:image/png;base64,${imageUrl}`} alt="Generated Waifu" /> : <p>Your waifu will appear here.</p>}
    </div>
  );
}

export default WaifuDisplay;
