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

// Atualiza valores globais em tempo real
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

// BOTÃO: CONNECT WALLET
document.getElementById('connectWalletBtn').addEventListener('click', async () => {
  if (window.solana && window.solana.isPhantom) {
    try {
      const resp = await window.solana.connect();
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

// INPUT DE SOL → CALCULAR DGV
document.getElementById('solInput').addEventListener('input', (e) => {
  const solAmount = parseFloat(e.target.value) || 0;
  const dgvAmount = solAmount * dgvPerSol;
  document.getElementById('dgvOutput').textContent = dgvAmount.toFixed(0);
  document.getElementById('totalRaised').textContent = (totalRaised - solAmount).toFixed(3);
});

// BOTÃO: BUY DGV
document.getElementById('buyDGV').addEventListener('click', async () => {
  alert('Buy DGV triggered!');
  
  if (window.solana && window.solana.isPhantom) {
    try {
      const provider = window.solana;
      const solAmount = parseFloat(document.getElementById('solInput').value);
      if (isNaN(solAmount) || solAmount <= 0) {
        alert('Please enter a valid SOL amount');
        return;
      }

      const lamports = solAmount * 1e9;
      const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('mainnet-beta'), 'confirmed');
      const transaction = new solanaWeb3.Transaction().add(
        solanaWeb3.SystemProgram.transfer({
          fromPubkey: provider.publicKey,
          toPubkey: new solanaWeb3.PublicKey('dzUzbAbRt3eWxjr3XheGwJjh6Yr8pn91SiM2DSB9rW9'),
          lamports: lamports,
        })
      );

      const { signature } = await provider.signAndSendTransaction(transaction);
      await connection.confirmTransaction(signature);

      totalRaised -= solAmount;
      const dgvBought = solAmount * dgvPerSol;

      // Atualiza no Firebase
      const userRef = ref(db, 'users/' + provider.publicKey.toString());
      const userSnapshot = await get(userRef);
      const userData = userSnapshot.val();
      const prevDGV = userData && userData.dgvBought ? userData.dgvBought : 0;
      await set(userRef, { dgvBought: prevDGV + dgvBought });

      await update(ref(db, 'global'), {
        totalRaised: totalRaised,
      });

      document.getElementById('totalRaised').textContent = totalRaised.toFixed(3);
      alert('Transaction successful! Signature: ' + signature);
    } catch (err) {
      console.error('Transaction failed:', err);
      alert('Transaction failed: ' + err.message);
    }
  } else {
    alert('Phantom Wallet not found');
  }
});

// CONTADOR USANDO nextPriceUpdateTimestamp
const countdownEl = document.getElementById('countdown');

onValue(ref(db, 'stats/nextPriceUpdateTimestamp'), (snap) => {
  const targetTimestamp = snap.val() * 1000; // convertendo para ms
  updateCountdown(targetTimestamp);
});

function updateCountdown(targetTime) {
  function tick() {
    const now = Date.now();
    const diff = targetTime - now;

    if (diff <= 0) {
      countdownEl.textContent = "00:00:00";
      return;
    }

    const hours = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0');
    const minutes = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
    const seconds = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');

    countdownEl.textContent = `${hours}:${minutes}:${seconds}`;
    requestAnimationFrame(tick);
  }

  tick();
}
