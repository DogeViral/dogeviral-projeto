import {
  Connection,
  PublicKey,
  clusterApiUrl,
  Transaction,
  SystemProgram
} from 'https://unpkg.com/@solana/web3.js@1.93.4/lib/index.iife.js';

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getDatabase, ref, get, set, update, onValue } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCieNTqqhudzt0NAmnpi2EEqha5UN08csc",
  authDomain: "dogeviral.firebaseapp.com",
  projectId: "dogeviral",
  storageBucket: "dogeviral.firebasestorage.app",
  messagingSenderId: "399656569787",
  appId: "1:399656569787:web:c85c0a2512db2e66b7529e"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let dgvPerSol = 1839150;
let totalRaised = 153;
let currentPrice = 0.001;

onValue(ref(db, 'global'), (snapshot) => {
  const data = snapshot.val();
  if (data) {
    dgvPerSol = data.dgvPerSol;
    totalRaised = data.totalRaised;
    currentPrice = data.currentPrice;
    document.getElementById('totalRaised').textContent = totalRaised.toFixed(3);
    document.getElementById('currentPrice').textContent = `$${currentPrice.toFixed(6)}`;
    document.getElementById('dgvPerSol').textContent = dgvPerSol;
  }
});

let provider = null;

document.getElementById('connectWalletBtn').addEventListener('click', async () => {
  if (!window.solana) {
    showPopup('❌ Phantom Wallet not detected. Please install Phantom.');
    return;
  }

  if (window.solana.isPhantom) {
    try {
      const resp = await window.solana.connect();
      provider = window.solana;
      console.log('Connected wallet:', resp.publicKey.toString());
      showPopup('✅ Connected: ' + resp.publicKey.toString());

      const userRef = ref(db, 'users/' + resp.publicKey.toString());
      const snapshot = await get(userRef);
      const userData = snapshot.val();
      const dgvBought = userData && userData.dgvBought ? userData.dgvBought : 0;
      showPopup(`ℹ️ You have bought ${dgvBought} DGV so far.`);
    } catch (err) {
      console.error('Connection failed:', err);
      showPopup('❌ Connection failed: ' + err.message);
    }
  } else {
    showPopup('❌ Phantom Wallet not found');
  }
});

document.getElementById('solInput').addEventListener('input', (e) => {
  const solAmount = parseFloat(e.target.value) || 0;
  const dgvAmount = solAmount * dgvPerSol;
  document.getElementById('dgvOutput').textContent = dgvAmount.toFixed(0);
});

document.getElementById('buyDGV').addEventListener('click', async () => {
  if (!provider) {
    showPopup('❌ Please connect your Phantom wallet first.');
    return;
  }

  const solAmount = parseFloat(document.getElementById('solInput').value);
  if (isNaN(solAmount) || solAmount <= 0) {
    showPopup('❌ Please enter a valid SOL amount.');
    return;
  }

  document.getElementById('buyDGV').disabled = true;
  showPopup('⏳ Processing transaction...');

  try {
    const lamports = solAmount * 1e9;
    const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: provider.publicKey,
        toPubkey: new PublicKey('dzUzbAbRt3eWxjr3XheGwJjh6Yr8pn91SiM2DSB9rW9'),
        lamports: lamports,
      })
    );

    transaction.feePayer = provider.publicKey;
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    const { signature } = await provider.signAndSendTransaction(transaction);
    await connection.confirmTransaction(signature, 'confirmed');

    const dgvBought = solAmount * dgvPerSol;

    const userRef = ref(db, 'users/' + provider.publicKey.toString());
    const userSnapshot = await get(userRef);
    const userData = userSnapshot.val();
    const prevDGV = userData && userData.dgvBought ? userData.dgvBought : 0;
    await set(userRef, { dgvBought: prevDGV + dgvBought });

    const userPurchaseRef = ref(db, 'userPurchases/' + provider.publicKey.toString());
    const prevAmountSnap = await get(userPurchaseRef);
    const prevAmount = prevAmountSnap.exists() ? prevAmountSnap.val() : 0;
    await set(userPurchaseRef, prevAmount + dgvBought);

    const newPurchaseRef = ref(db, 'purchases/' + Date.now());
    await set(newPurchaseRef, {
      name: provider.publicKey.toString().slice(0, 6) + '...',
      country: 'unknown',
      amount: dgvBought
    });

    totalRaised -= solAmount; // mantido como você pediu
    await update(ref(db, 'global'), { totalRaised });

    document.getElementById('totalRaised').textContent = totalRaised.toFixed(3);
    document.getElementById('solInput').value = '';
    document.getElementById('dgvOutput').textContent = '0';

    showPopup(`✅ Purchase successful: ${dgvBought.toLocaleString()} DGV!`);
  } catch (err) {
    console.error('Transaction failed:', err);
    showPopup('❌ Transaction failed: ' + err.message);
  } finally {
    document.getElementById('buyDGV').disabled = false;
  }
});

function showPopup(message) {
  let popup = document.getElementById('purchasePopup');
  if (!popup) {
    popup = document.createElement('div');
    popup.id = 'purchasePopup';
    popup.style.position = 'fixed';
    popup.style.bottom = '20px';
    popup.style.left = '50%';
    popup.style.transform = 'translateX(-50%)';
    popup.style.background = '#333';
    popup.style.color = '#fff';
    popup.style.padding = '10px 20px';
    popup.style.borderRadius = '8px';
    popup.style.zIndex = '1000';
    document.body.appendChild(popup);
  }
  popup.textContent = message;
  popup.style.display = 'block';
  setTimeout(() => {
    popup.style.display = 'none';
  }, 4000);
}
// Atualização forçada para testar deploy
