// Conectar com Phantom Wallet
document.getElementById('connectWalletBtn')?.addEventListener('click', async () => {
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

// Simular ação de compra
document.getElementById('buyDGV')?.addEventListener('click', async () => {
  alert('Buy DGV triggered!');
});
