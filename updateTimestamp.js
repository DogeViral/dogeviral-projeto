import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getDatabase, ref, update } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCieNTqqhudzt0NAmnpi2EEqha5UN08csc",
  authDomain: "dogeviral.firebaseapp.com",
  databaseURL: "https://dogeviral-default-rtdb.firebaseio.com",  // <-- ESSA LINHA É ESSENCIAL
  projectId: "dogeviral",
  storageBucket: "dogeviral.appspot.com",
  messagingSenderId: "399656569787",
  appId: "1:399656569787:web:c85c0a2512db2e66b7529e"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const newTimestamp = Math.floor(Date.now() / 1000) + 172800;

update(ref(db, 'stats'), {
  nextPriceUpdateTimestamp: newTimestamp
})
.then(() => {
  console.log('nextPriceUpdateTimestamp atualizado com sucesso:', newTimestamp);
  alert('nextPriceUpdateTimestamp atualizado com sucesso: ' + newTimestamp);
})
.catch((error) => {
  console.error('Erro ao atualizar timestamp:', error);
  alert('Erro ao atualizar timestamp: ' + error.message);
});
