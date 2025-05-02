import './style.css';
import javascriptLogo from './javascript.svg';
import viteLogo from '/vite.svg';
import { setupCounter } from './counter.js';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get } from 'firebase/database';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBgxA4JqgGPR6n6_fF_UpOY_rPvIISrK2A",
  authDomain: "dogeviral.firebaseapp.com",
  databaseURL: "https://dogeviral-default-rtdb.firebaseio.com",
  projectId: "dogeviral",
  storageBucket: "dogeviral.appspot.com",
  messagingSenderId: "415759204417",
  appId: "1:415759204417:web:4412f47e2e9b3ebef44c93"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

async function fetchStats() {
  const statsRef = ref(database, 'stats');
  try {
    const snapshot = await get(statsRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      document.getElementById('totalRaised').innerText = data.totalRaised;
      document.getElementById('currentPrice').innerText = data.currentPrice;
      document.getElementById('dgvPerSol').innerText = data.dgvPerSol;
      document.getElementById('countdown').innerText = data.countdown;
    }
  } catch (error) {
    console.error('Erro ao buscar stats:', error);
  }
}

fetchStats();

document.querySelector('#app').innerHTML = `
  <div>
    <h1>DogeViral Presale</h1>
    <input type="number" id="solAmount" placeholder="Amount in SOL" min="0" step="0.01" />
    <button id="connectWalletBtn">Connect Wallet</button>
    <button id="buyDGV">Buy</button>
    <div>Your DGV: <span id="dgvOutput">0</span></div>
    <div>Total Raised: <span id="totalRaised"></span></div>
    <div>Current Price: <span id="currentPrice"></span></div>
    <div>DGV per SOL: <span id="dgvPerSol"></span></div>
    <div>Countdown: <span id="countdown"></span></div>
  </div>
`;

setupCounter(document.querySelector('#counter'));
