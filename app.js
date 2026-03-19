// ═══════════════════════════════════════
//   ALLMOSSO — RU IFTO Palmas
//   app.js  (v2 — cardápio via Firebase)
// ═══════════════════════════════════════

const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyBsxvV05vcr6abE822Y-pYljmbYWUucfnQ",
  authDomain:        "allmosso-testes.firebaseapp.com",
  databaseURL:       "https://allmosso-testes-default-rtdb.firebaseio.com",
  projectId:         "allmosso-testes",
  storageBucket:     "allmosso-testes.firebasestorage.app",
  messagingSenderId: "408789882571",
  appId:             "1:408789882571:web:88c5965e5c13d67267ad4e",
};

const CAMPOS_MAP = [
  { key: 'proteico',       label: 'Prato Proteico',  icon: '🍗' },
  { key: 'guarnicao',      label: 'Guarnição',        icon: '🍝' },
  { key: 'salada',         label: 'Salada',           icon: '🥗' },
  { key: 'acompanhamento', label: 'Acompanhamento',   icon: '🍚' },
  { key: 'vegetariano',    label: 'Vegetariano',      icon: '🌱' },
];

const FERIADOS_FIXOS = {
  '01/01': 'Confraternização Universal 🎆',
  '16/02': 'Carnaval (ponto facultativo) 🎭',
  '17/02': 'Carnaval (ponto facultativo) 🎭',
  '18/02': 'Quarta-feira de Cinzas (ponto facultativo até 14h) 🎭',
  '19/03': 'Dia de São José — Padroeiro de Palmas 🙏',
  '03/04': 'Paixão de Cristo 🕊️',
  '21/04': 'Tiradentes 🇧🇷',
  '01/05': 'Dia Mundial do Trabalho 👷',
  '20/05': 'Aniversário de Palmas 🎂',
  '04/06': 'Corpus Christi (ponto facultativo) ✝️',
  '15/08': 'Senhor do Bonfim (feriado estadual) 🙏',
  '07/09': 'Independência do Brasil 🇧🇷',
  '08/09': 'Nossa Sra. da Natividade — Padroeira do Tocantins 🙏',
  '05/10': 'Criação do Estado do Tocantins (feriado estadual) 🏛️',
  '12/10': 'Nossa Sra. Aparecida — Padroeira do Brasil 🇧🇷',
  '15/10': 'Dia do Professor (feriado escolar) 👩‍🏫',
  '28/10': 'Dia do Servidor Público (ponto facultativo) 📋',
  '02/11': 'Finados 🕯️',
  '15/11': 'Proclamação da República 🇧🇷',
  '20/11': 'Dia da Consciência Negra ✊',
  '24/12': 'Véspera do Natal (ponto facultativo após 14h) 🎄',
  '25/12': 'Natal 🎄',
  '31/12': 'Véspera do Ano Novo (ponto facultativo após 14h) 🎆',
};

const WA_LINK = 'https://wa.me/5563999614831';

const DIAS       = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
const DIAS_SHORT = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const MESES      = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];

const now   = new Date();
const today = now.getDay();

function toKey(date) {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${d}/${m}`;
}

function getWeekKey() {
  const d = new Date(now);
  d.setHours(0,0,0,0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  const wn = 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  return `${d.getFullYear()}-W${String(wn).padStart(2,'0')}`;
}

const todayKey      = toKey(now);
const isFeriadoFixo = todayKey in FERIADOS_FIXOS;
const WEEK_KEY      = getWeekKey();

document.getElementById('header-date').textContent =
  `${DIAS[today]}, ${now.getDate()} de ${MESES[now.getMonth()]}`;

const waLink = document.getElementById('wa-link');
if (waLink) waLink.href = WA_LINK;

let CARDAPIO_FB = {};

function fbDayToCard(dayData) {
  if (!dayData || dayData.feriado) return null;
  const items = dayData.items || {};
  return {
    data: dayData.data || '',
    emoji: detectEmoji(items.proteico || ''),
    items: CAMPOS_MAP.map(c => ({
      label: c.label,
      icon:  detectEmoji(items[c.key] || ''),  // ← era c.icon, agora é dinâmico
      name:  items[c.key] || '—',
    })),
  };
}

function detectEmoji(prato) {
  if (!prato) return '🍽️';
  const p = prato.toLowerCase();

   // Combinações (sempre primeiro!)
  if ((p.includes('arroz') && p.includes('feijão')) ||
      (p.includes('arroz') && p.includes('feijao'))) return '🍛';

  // Frango / Aves
  if (p.includes('frango') || p.includes('galinha') || p.includes('peito') ||
      p.includes('coxa') || p.includes('sobrecoxa') || p.includes('ave') ||
      p.includes('chester') || p.includes('peru')) return '🍗';

  // Peixe / Frutos do mar
  if (p.includes('peixe') || p.includes('tilápia') || p.includes('atum') ||
      p.includes('salmão') || p.includes('bacalhau') || p.includes('sardinha') ||
      p.includes('camarão') || p.includes('filé de peixe')) return '🐟';

  // Carne bovina
  if (p.includes('carne') || p.includes('bife') || p.includes('alcatra') ||
      p.includes('lagarto') || p.includes('patinho') || p.includes('acém') ||
      p.includes('costela') || p.includes('picanha') || p.includes('músculo') ||
      p.includes('contrafilé') || p.includes('file') || p.includes('filé') ||
      p.includes('assado') || p.includes('bovino')) return '🥩';

  // Porco
  if (p.includes('porco') || p.includes('lombo') || p.includes('linguiça') ||
      p.includes('linguica') || p.includes('pernil') || p.includes('bacon') ||
      p.includes('suíno') || p.includes('suino')) return '🥓';

  // Ovo
  if (p.includes('ovo') || p.includes('ovos') || p.includes('mexido') ||
      p.includes('estrelado') || p.includes('cozido')) return '🍳';

  // Macarrão / Massa
  if (p.includes('macarrão') || p.includes('macarrao') || p.includes('massa') ||
      p.includes('espaguete') || p.includes('lasanha') || p.includes('nhoque') ||
      p.includes('talharim') || p.includes('fusilli') || p.includes('penne')) return '🍝';

  // Arroz
  if (p.includes('arroz')) return '🍚';

  // Feijão / Leguminosas
  if (p.includes('feijão') || p.includes('feijao') || p.includes('lentilha') ||
      p.includes('grão') || p.includes('grao') || p.includes('ervilha')) return '🫘';

  // Sopa / Caldo
  if (p.includes('sopa') || p.includes('caldo') || p.includes('creme de') ||
      p.includes('mingau')) return '🍲';

  // Vegetariano / PTS / Tofu
  if (p.includes('pts') || p.includes('soja') || p.includes('tofu') ||
      p.includes('vegano') || p.includes('vegetariano') || p.includes('almôndega') ||
      p.includes('almondega')) return '🌱';

  // Batata
  if (p.includes('batata') || p.includes('purê') || p.includes('pure')) return '🥔';

  // Salada / Verdura
  if (p.includes('salada') || p.includes('alface') || p.includes('rúcula') ||
      p.includes('rucula') || p.includes('acelga') || p.includes('repolho') ||
      p.includes('couve') || p.includes('espinafre')) return '🥗';

  // Legumes
  if (p.includes('cenoura') || p.includes('beterraba') || p.includes('abobrinha') ||
      p.includes('chuchu') || p.includes('brócolis') || p.includes('brocolis') ||
      p.includes('couve-flor') || p.includes('vagem') || p.includes('berinjela') ||
      p.includes('tomate') || p.includes('pepino')) return '🥦';

  // Hambúrguer / Lanche
  if (p.includes('hambúrguer') || p.includes('hamburguer') ||
      p.includes('lanche') || p.includes('sanduíche')) return '🍔';

  // Pizza
  if (p.includes('pizza')) return '🍕';

  // Padrão
  return '🍽️';
}

function renderCard(dayIndex, checkFeriado = false) {
  const todayData = CARDAPIO_FB[dayIndex];

  if (checkFeriado) {
    if (todayData && todayData.feriado) {
      const nome = todayData.feriadoNome || FERIADOS_FIXOS[todayKey] || 'Feriado';
      return msgFeriado(nome);
    }
    if (isFeriadoFixo && !todayData) {
      return msgFeriado(FERIADOS_FIXOS[todayKey]);
    }
  }

  const d = fbDayToCard(todayData);

  if (!d) {
    if (dayIndex === 0 || dayIndex === 6) {
      return `<div class="weekend-msg">
        <span class="emoji">😴</span>
        <h2>Sem almoço hoje!</h2>
        <p>O RU não funciona aos finais de semana.<br>Aproveite o descanso! 🌴</p>
      </div>`;
    } else {
      const nome = (todayData && todayData.feriadoNome) || FERIADOS_FIXOS[todayKey];
      if (nome) return msgFeriado(nome);
      return `<div class="weekend-msg">
        <span class="emoji">📋</span>
        <h2>Cardápio não disponível</h2>
        <p>O cardápio desta semana ainda não foi cadastrado.<br>Verifique mais tarde! 🕐</p>
      </div>`;
    }
  }

  const items = d.items.map(i => `
    <div class="menu-item">
      <div class="item-icon">${i.icon}</div>
      <div class="item-info">
        <div class="item-label">${i.label}</div>
        <div class="item-name">${i.name}</div>
      </div>
    </div>`).join('');

  return `
    <div class="day-card">
      <div class="day-card-header">
        <div class="day-card-header-left">
          <div class="day-emoji">${d.emoji}</div>
          <div>
            <span>Cardápio de hoje</span>
            <h2>${DIAS[dayIndex]}-feira</h2>
          </div>
        </div>
        <div class="card-date-badge">📅 ${d.data}</div>
      </div>
      <div class="menu-items">${items}</div>
    </div>`;
}

function msgFeriado(nome) {
  return `<div class="weekend-msg">
    <span class="emoji">🎉</span>
    <h2>Feriado!</h2>
    <p><strong>${nome}</strong><br>O RU não funciona hoje.<br>Bom feriado! 🥳</p>
  </div>`;
}

let selectedDay = (today === 0 || today === 6) ? 1 : today;

function buildWeekNav() {
  const nav = document.getElementById('week-nav');
  nav.innerHTML = '';
  [1,2,3,4,5].forEach(d => {
    const pill = document.createElement('button');
    pill.className = 'day-pill'
      + (d === today       ? ' today-pill' : '')
      + (d === selectedDay ? ' active'     : '');
    pill.innerHTML = `${DIAS_SHORT[d]}<small>${d === today ? 'hoje' : ''}</small>`;
    pill.onclick = () => { selectedDay = d; buildWeekNav(); buildWeekCard(); };
    nav.appendChild(pill);
  });
}

function buildWeekCard() {
  document.getElementById('week-card-content').innerHTML = renderCard(selectedDay);
}

function showTab(tab) {
  const isHoje = tab === 'hoje';
  document.getElementById('sec-hoje').classList.toggle('hidden',   !isHoje);
  document.getElementById('sec-semana').classList.toggle('hidden',  isHoje);
  document.getElementById('tab-hoje').classList.toggle('active',    isHoje);
  document.getElementById('tab-semana').classList.toggle('active', !isHoje);
}

const VOTED_KEY = `allmosso_voted_${WEEK_KEY}`;
let userVote    = localStorage.getItem(VOTED_KEY);
let db          = null;
let votesData   = { 1:0, 2:0, 3:0, 4:0, 5:0 };

function getVoteDias() {
  return [1,2,3,4,5].map(k => {
    const d    = CARDAPIO_FB[k];
    const card = fbDayToCard(d);
    return {
      key:   k,
      label: DIAS[k],
      data:  d ? d.data : null,
      emoji: card ? card.emoji : '🎉',
      prato: card ? (card.items.find(i => i.label === 'Prato Proteico')?.name || '—') : 'Feriado',
      isFer: (!d) || d.feriado,
    };
  });
}

function initFirebase() {
  try {
    firebase.initializeApp(FIREBASE_CONFIG);
    db = firebase.database();

    // Renderiza imediatamente com o que tiver
    document.getElementById('sec-hoje').innerHTML = renderCard(today, true);
    buildWeekNav();
    buildWeekCard();
    renderVotacao(false);

    // Atualiza quando o Firebase responder
    db.ref(`cardapio/${WEEK_KEY}`).on('value', snap => {
      CARDAPIO_FB = snap.val() || {};
      document.getElementById('sec-hoje').innerHTML = renderCard(today, true);
      buildWeekNav();
      buildWeekCard();
      renderVotacao(true);
    });

    // Votos em tempo real
    db.ref(`votos/${WEEK_KEY}`).on('value', snap => {
      const data = snap.val() || {};
      [1,2,3,4,5].forEach(k => { votesData[k] = data[k] || 0; });
      renderVotacao(true);
    });

  } catch(e) {
    console.error('Firebase error:', e);
    document.getElementById('sec-hoje').innerHTML = renderCard(today, true);
    buildWeekNav();
    buildWeekCard();
    renderVotacao(false);
  }
}

function castVote(dayKey) {
  const prevVote = userVote;
  const newVote  = String(dayKey);
  if (prevVote === newVote) return;

  userVote = newVote;
  localStorage.setItem(VOTED_KEY, userVote);

  if (db) {
    const updates = {};
    if (prevVote) updates[`votos/${WEEK_KEY}/${prevVote}`] = firebase.database.ServerValue.increment(-1);
    updates[`votos/${WEEK_KEY}/${newVote}`] = firebase.database.ServerValue.increment(1);
    db.ref().update(updates);
  } else {
    if (prevVote) votesData[prevVote] = Math.max(0, (votesData[prevVote] || 0) - 1);
    votesData[newVote] = (votesData[newVote] || 0) + 1;
    renderVotacao(false);
  }
}

function renderVotacao(firebaseAtivo) {
  const container = document.getElementById('votacao-container');
  if (!container) return;

  const total     = Object.values(votesData).reduce((a,b) => a+b, 0);
  const hasVoted  = !!userVote;
  const VOTE_DIAS = getVoteDias();

  const dias = VOTE_DIAS.map(v => {
    const votos     = votesData[v.key] || 0;
    const pct       = total > 0 ? Math.round((votos / total) * 100) : 0;
    const isVoted   = String(v.key) === String(userVote);
    const clickable = !v.isFer && !isVoted;

    return `
      <div class="vote-item ${isVoted ? 'voted' : ''} ${v.isFer ? 'feriado' : ''} ${clickable ? 'clickable' : ''}"
           onclick="${v.isFer ? '' : `castVote(${v.key})`}">
        <div class="vote-item-left">
          <span class="vote-emoji">${v.emoji}</span>
          <div class="vote-info">
            <span class="vote-dia">${v.label} ${v.data ? `<small>📅 ${v.data}</small>` : ''}</span>
            <span class="vote-prato">${v.prato}</span>
          </div>
        </div>
        <div class="vote-right">
          ${hasVoted ? `
            <div class="vote-bar-wrap">
              <div class="vote-bar" style="width:${pct}%"></div>
            </div>
            <span class="vote-pct">${pct}%</span>
          ` : `
            <span class="vote-btn-hint">${v.isFer ? '🎉' : '👆 votar'}</span>
          `}
          ${isVoted ? '<span class="vote-check">✅</span>' : ''}
        </div>
      </div>`;
  }).join('');

  container.innerHTML = `
    <div class="votacao-card">
      <div class="votacao-header">
        <span class="votacao-icon">🏆</span>
        <div>
          <p class="votacao-title">Qual foi o melhor almoço?</p>
          <p class="votacao-sub">${hasVoted
            ? `${total} voto${total !== 1 ? 's' : ''} essa semana · toque em outro para trocar`
            : 'Vote no seu favorito da semana!'}</p>
        </div>
      </div>
      <div class="vote-list">${dias}</div>
    </div>`;
}

// ─────────────────────────────────────────
// INICIALIZAÇÃO
// ─────────────────────────────────────────
buildWeekNav();
buildWeekCard();
initFirebase();