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

document.getElementById('connectWallet').addEventListener('click', async () => {
  if (window.solana && window.solana.isPhantom) {
    try {
      const resp = await window.solana.connect();
      provider = window.solana;
      alert('Connected: ' + resp.publicKey.toString());

      const userRef = ref(db, 'users/' + resp.publicKey.toString());
      const snapshot = await get(userRef);
      const userData = snapshot.val();
      const dgvBought = userData && userData.dgvBought ? userData.dgvBought : 0;
      alert(`You have bought ${dgvBought} DGV so far.`);
    } catch (err) {
      console.error('Connection failed:', err);
    }
  } else {
    alert('Phantom Wallet not found');
  }
});

document.getElementById('solAmount').addEventListener('input', (e) => {
  const solAmount = parseFloat(e.target.value) || 0;
  const dgvAmount = solAmount * dgvPerSol;
  document.getElementById('dgvOutput').textContent = dgvAmount.toFixed(0);
});

document.getElementById('buyButton').addEventListener('click', async () => {
  if (!provider) {
    alert('Please connect your Phantom wallet first.');
    return;
  }

  const solAmount = parseFloat(document.getElementById('solAmount').value);
  if (isNaN(solAmount) || solAmount <= 0) {
    alert('Please enter a valid SOL amount');
    return;
  }

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
    await connection.confirmTransaction(signature);

    const dgvBought = solAmount * dgvPerSol;

    const userRef = ref(db, 'users/' + provider.publicKey.toString());
    const userSnapshot = await get(userRef);
    const userData = userSnapshot.val();
    const prevDGV = userData && userData.dgvBought ? userData.dgvBought : 0;
    await set(userRef, { dgvBought: prevDGV + dgvBought });

    await update(ref(db, 'global'), { totalRaised: totalRaised - solAmount });

    document.getElementById('totalRaised').textContent = (totalRaised - solAmount).toFixed(3);
    alert('Transaction successful! Signature: ' + signature);
  } catch (err) {
    console.error('Transaction failed:', err);
    alert('Transaction failed: ' + err.message);
  }
});
