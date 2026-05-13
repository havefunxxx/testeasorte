// Configuração da API do Google Sheets
const API_URL = 'https://script.google.com/macros/s/SEU_SCRIPT_ID/exec'; // Substitua pelo ID do seu script

// Lista de prêmios disponíveis
const PREMIOS = [
    { nome: "🎁 10% OFF", peso: 30 },
    { nome: "🎉 20% OFF", peso: 20 },
    { nome: "⭐ Brinde Grátis", peso: 15 },
    { nome: "💎 50% OFF", peso: 10 },
    { nome: "🏆 Prêmio Especial", peso: 5 },
    { nome: "🍫 Chocolate", peso: 8 },
    { nome: "🎫 Vale-presente R$50", peso: 5 },
    { nome: "🚀 Frete Grátis", peso: 7 }
];

let isSpinning = false;

// Função para sortear prêmio baseado nos pesos
function sortearPremio() {
    const pesoTotal = PREMIOS.reduce((sum, premio) => sum + premio.peso, 0);
    let random = Math.random() * pesoTotal;
    
    let acumulado = 0;
    for (const premio of PREMIOS) {
        acumulado += premio.peso;
        if (random <= acumulado) {
            return premio;
        }
    }
    return PREMIOS[0];
}

// Função para animação da roleta
async function animarRoleta() {
    const slots = document.querySelectorAll('.slot');
    const premioDisplay = document.getElementById('premioCorrente');
    const duracao = 2000; // 2 segundos
    const intervalo = 50; // 50ms entre trocas
    const numTrocas = duracao / intervalo;
    
    // Adiciona classe de animação
    slots.forEach(slot => slot.classList.add('animating'));
    
    // Animação de troca de ícones
    for (let i = 0; i < numTrocas; i++) {
        await new Promise(resolve => setTimeout(resolve, intervalo));
        
        // Troca os ícones dos slots
        const icones = ['🎁', '🎰', '✨', '⭐', '💎', '🏆', '🎫', '🍫', '🚀', '🎉'];
        slots.forEach(slot => {
            const iconAleatorio = icones[Math.floor(Math.random() * icones.length)];
            slot.textContent = iconAleatorio;
        });
        
        // Mostra prêmios aleatórios no display
        const premioAleatorio = PREMIOS[Math.floor(Math.random() * PREMIOS.length)];
        premioDisplay.innerHTML = `<span class="premio-label">${premioAleatorio.nome}</span>`;
    }
    
    // Remove animação
    slots.forEach(slot => slot.classList.remove('animating'));
}

// Função para registrar ganho no Google Sheets
async function registrarGanho(nick, premio) {
    const dados = {
        nick: nick,
        premio: premio.nome
    };
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dados)
        });
        
        console.log('Registrado com sucesso!');
        return true;
    } catch (error) {
        console.error('Erro ao registrar:', error);
        return false;
    }
}

// Função para mostrar resultado
function mostrarResultado(nick, premio) {
    document.getElementById('vencedorNome').textContent = nick;
    document.getElementById('premioGanho').textContent = premio.nome;
    document.getElementById('resultado').style.display = 'flex';
    
    // Efeito de confetes
    criarConfetes();
}

// Função para criar efeito de confetes
function criarConfetes() {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    
    for (let i = 0; i < 100; i++) {
        const confete = document.createElement('div');
        confete.style.position = 'fixed';
        confete.style.left = Math.random() * window.innerWidth + 'px';
        confete.style.top = '-10px';
        confete.style.width = Math.random() * 10 + 5 + 'px';
        confete.style.height = Math.random() * 10 + 5 + 'px';
        confete.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confete.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        confete.style.pointerEvents = 'none';
        confete.style.zIndex = '9999';
        confete.style.animation = `fall ${Math.random() * 2 + 1}s linear forwards`;
        
        document.body.appendChild(confete);
        
        setTimeout(() => confete.remove(), 3000);
    }
}

// Adiciona o CSS da animação de queda
const style = document.createElement('style');
style.textContent = `
    @keyframes fall {
        to {
            transform: translateY(${window.innerHeight + 10}px) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Função principal para girar
async function girarRoleta() {
    if (isSpinning) return;
    
    const nickInput = document.getElementById('nickname');
    const nick = nickInput.value.trim();
    
    if (!nick) {
        alert('Por favor, digite seu nome/nick!');
        nickInput.focus();
        return;
    }
    
    isSpinning = true;
    const girarBtn = document.getElementById('girarBtn');
    girarBtn.disabled = true;
    girarBtn.innerHTML = '<span class="btn-text">GIRANDO...</span><span class="btn-icon">🎲</span>';
    
    try {
        // Animação da roleta
        await animarRoleta();
        
        // Sorteia o prêmio final
        const premioSorteado = sortearPremio();
        
        // Mostra o prêmio final
        const premioDisplay = document.getElementById('premioCorrente');
        premioDisplay.innerHTML = `<span class="premio-label">${premioSorteado.nome}</span>`;
        
        // Registra no Google Sheets
        await registrarGanho(nick, premioSorteado);
        
        // Mostra resultado
        mostrarResultado(nick, premioSorteado);
        
        // Atualiza histórico
        carregarHistorico();
        
    } catch (error) {
        console.error('Erro ao girar roleta:', error);
        alert('Ocorreu um erro. Tente novamente!');
    } finally {
        isSpinning = false;
        girarBtn.disabled = false;
        girarBtn.innerHTML = '<span class="btn-text">GIRAR</span><span class="btn-icon">🎲</span>';
    }
}

// Função para fechar resultado
function fecharResultado() {
    document.getElementById('resultado').style.display = 'none';
    document.getElementById('nickname').value = '';
    document.getElementById('nickname').focus();
}

// Função para carregar histórico
async function carregarHistorico() {
    try {
        // Nota: Você precisará criar uma função doGet no Google Apps Script
        // para retornar os dados da planilha como JSON
        const response = await fetch(`${API_URL}?action=get`);
        const data = await response.json();
        
        const listaGanhadores = document.getElementById('listaGanhadores');
        listaGanhadores.innerHTML = '';
        
        if (data && data.length > 0) {
            data.slice(-10).reverse().forEach(item => {
                const div = document.createElement('div');
                div.className = 'ganhador-item';
                div.innerHTML = `
                    <div>
                        <span class="ganhador-nome">${item.nick}</span>
                        <div class="ganhador-data">${new Date(item.data).toLocaleString()}</div>
                    </div>
                    <div class="ganhador-premio">${item.premio}</div>
                `;
                listaGanhadores.appendChild(div);
            });
        } else {
            listaGanhadores.innerHTML = '<div class="loading">Nenhum ganhador ainda!</div>';
        }
    } catch (error) {
        console.error('Erro ao carregar histórico:', error);
        document.getElementById('listaGanhadores').innerHTML = '<div class="loading">Erro ao carregar histórico</div>';
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('girarBtn').addEventListener('click', girarRoleta);
    document.getElementById('nickname').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') girarRoleta();
    });
    
    carregarHistorico();
});