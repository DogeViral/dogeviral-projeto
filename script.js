document.getElementById('connectWalletBtn').addEventListener('click', async () => {
  if (window.solana && window.solana.isPhantom) {
    try {
      const resp = await window.solana.connect();
      alert('Connected: ' + resp.publicKey.toString());
    } catch (err) {
      console.error('Connection failed:', err);
    }
  } else {
    alert('Phantom Wallet not found');
  }
});

document.getElementById('buyDGV').addEventListener('click', async () => {
  // Aqui continua a lógica de envio de SOL como já foi configurado com você.
  alert('Buy DGV triggered!');
});
