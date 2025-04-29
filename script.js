import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
} from '@solana/web3.js';

let walletAddress = null;
const DGV_PER_SOL = 1000000;
const destinoSolana = new PublicKey("dzUzbAbRt3eWxjr3XheGwJjh6Yr8pn91SiM2DSB9rW9");

// Função para conectar a carteira Phantom
async function conectarCarteira() {
  if (window.solana && window.solana.isPhantom) {
    try {
      const resp = await window.solana.connect();
      walletAddress = resp.publicKey.toString();
      alert("Carteira conectada: " + walletAddress);
      mostrarHistorico();
    } catch (err) {
      alert("Erro ao conectar: " + err.message);
    }
  } else {
    alert("Instale a Phantom Wallet para continuar.");
  }
}

// Atualiza o valor de DGV estimado ao digitar SOL
document.getElementById("solAmount").addEventListener("input", (e) => {
  const sol = parseFloat(e.target.value) || 0;
  document.getElementById("dgvAmount").innerText = `Você receberá: ${sol * DGV_PER_SOL} DGV`;
});

// Botão conectar carteira
document.getElementById("connectWallet").addEventListener("click", conectarCarteira);

// Função para comprar DGV
document.getElementById("buyDGV").addEventListener("click", async () => {
  if (!walletAddress) return alert("Conecte sua carteira primeiro!");

  const sol = parseFloat(document.getElementById("solAmount").value);
  if (!sol || sol <= 0) return alert("Digite um valor válido em SOL.");

  try {
    const connection = new Connection(
      "https://mainnet.helius-rpc.com/?api-key=2a3fec42-02e7-4adc-b15f-6fd7e0814b06",
      "confirmed"
    );
    const provider = window.solana;
    const fromPubkey = provider.publicKey;

    // Cria a transação
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey: destinoSolana,
        lamports: sol * 1e9,
      })
    );

    // Configura a transação corretamente com blockhash
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transaction.feePayer = fromPubkey;

    // Assina e envia a transação
    const signed = await provider.signTransaction(transaction);
    const txid = await connection.sendRawTransaction(signed.serialize());
    await connection.confirmTransaction(txid);

    alert("Compra realizada com sucesso! TX: " + txid);

    salvarHistorico(sol);
    mostrarHistorico();
  } catch (e) {
    console.error(e);
    alert("Erro na transação: " + e.message);
  }
});

function salvarHistorico(sol) {
  const chave = "dgv_" + walletAddress;
  const atual = parseFloat(localStorage.getItem(chave)) || 0;
  const novo = atual + sol * DGV_PER_SOL;
  localStorage.setItem(chave, novo.toString());
}

function mostrarHistorico() {
  const chave = "dgv_" + walletAddress;
  const comprado = localStorage.getItem(chave);
  document.getElementById("historicoCompra").innerText =
    comprado ? `${comprado} DGV comprados até agora.` : "Nenhuma compra registrada.";
}
