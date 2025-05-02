import './style.css';
import javascriptLogo from './javascript.svg';
import viteLogo from '/vite.svg';
import { setupCounter } from './counter.js';

// Importa o Firebase
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get } from 'firebase/database';

// Configuração do seu projeto Firebase (com valores reais que você me passou)
const firebaseConfig = {
  apiKey: "AIzaSyBgxA4JqgGPR6n6_fF_UpOY_rPvIISrK2A",
  authDomain: "dogeviral.firebaseapp.com",
  databaseURL: "https://dogeviral-default-rtdb.firebaseio.com",
  projectId: "dogeviral",
  storageBucket: "dogeviral.appspot.com",
  messagingSenderId: "415759204417",
  appId: "1:415759204417:web:4412f47e2e9b3ebef44c93"
};

// Inicializa o app
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

async function fetchStats() {
  const statsRef = ref(database, 'stats');
  try {
    const snapshot = await get(statsRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      console.log('Stats:', data);
      document.getElementById('totalRaised').innerText = data.totalRaised;
      document.getElementById('currentPrice').innerText = data.currentPrice;
      document.getElementById('dgvPerSol').innerText = data.dgvPerSol;
      document.getElementById('countdown').innerText = data.countdown;
    } else {
      console.log('Nenhum dado encontrado.');
    }
  } catch (error) {
    console.error('Erro ao buscar stats:', error);
  }
}

// Chama a função
fetchStats();

document.querySelector('#app').innerHTML = `
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
      <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
    </a>
    <h1>Hello Vite!</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <div>Total Raised: <span id="totalRaised"></span></div>
    <div>Current Price: <span id="currentPrice"></span></div>
    <div>DGV per SOL: <span id="dgvPerSol"></span></div>
    <div>Countdown: <span id="countdown"></span></div>
    <p class="read-the-docs">
      Click on the Vite logo to learn more
    </p>
  </div>
`;

setupCounter(document.querySelector('#counter'));
