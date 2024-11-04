// src/components/ClaimButton.js
import React from 'react';

function ClaimButton({ onClick }) {
  return (
    <button onClick={onClick} className="claim-button">
      Claim Your Waifu
    </button>
  );
}

export default ClaimButton;
