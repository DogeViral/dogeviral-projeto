import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCieNTqqhudzt0NAmnpi2EEqha5UN08csc",
  authDomain: "dogeviral.firebaseapp.com",
  databaseURL: "https://dogeviral-default-rtdb.firebaseio.com",
  projectId: "dogeviral",
  storageBucket: "dogeviral.appspot.com",
  messagingSenderId: "399656569787",
  appId: "1:399656569787:web:c85c0a2512db2e66b7529e"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

function updateCountdown(timestamp) {
  const countdownElement = document.getElementById('countdown');
  
  function tick() {
    const now = Math.floor(Date.now() / 1000);
    let diff = timestamp - now;

    if (diff < 0) diff = 0;

    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;

    countdownElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  tick();
  setInterval(tick, 1000);
}

const timestampRef = ref(db, 'stats/nextPriceUpdateTimestamp');
onValue(timestampRef, (snapshot) => {
  const timestamp = snapshot.val();
  updateCountdown(timestamp);
});
