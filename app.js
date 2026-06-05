const STORAGE_KEY = "stumbleLeagueManagerData";
const LOGIN_KEY = "stumbleLeagueAdminLoggedIn";

const DEFAULT_PASSWORD = "admin123";

const SCORE_TABLE = {
  1: 18,
  2: 15,
  3: 13,
  4: 12,
  5: 11
};

const DEFAULT_PLAYERS = [
  {
    id: 1,
    name: "Sankalp",
    username: "sankalp_op",
    nickname: ""
  },
  {
    id: 2,
    name: "Akshat Rakesh",
    username: "terrorbebu",
    nickname: ""
  },
  {
    id: 3,
    name: "Atharva Mishra",
    username: "panditdabang",
    nickname: ""
  },
  {
    id: 4,
    name: "Nayan Mehrotra",
    username: "nbot",
    nickname: ""
  },
  {
    id: 5,
    name: "Yugank Dwivedi",
    username: "yuggu",
    nickname: ""
  }
];

const ACHIEVEMENTS = [
  { id: "first_win", icon: "🥇", name: "First Win", condition: player => player.stats.wins >= 1 },
  { id: "streak_5", icon: "🔥", name: "5 Match Win Streak", condition: player => player.stats.longestStreak >= 5 },
  { id: "streak_10", icon: "🔥", name: "10 Match Win Streak", condition: player => player.stats.longestStreak >= 10 },
  { id: "streak_20", icon: "🔥", name: "20 Match Win Streak", condition: player => player.stats.longestStreak >= 20 },

  { id: "first_tournament", icon: "🏆", name: "First Tournament Win", condition: player => player.stats.tournamentsWon >= 1 },
  { id: "tournament_5", icon: "🏆", name: "5 Tournament Wins", condition: player => player.stats.tournamentsWon >= 5 },
  { id: "tournament_10", icon: "🏆", name: "10 Tournament Wins", condition: player => player.stats.tournamentsWon >= 10 },
  { id: "tournament_25", icon: "👑", name: "Tournament King - 25 Wins", condition: player => player.stats.tournamentsWon >= 25 },

  { id: "first_cup", icon: "🥇", name: "First Cup", condition: player => player.stats.cupsWon >= 1 },
  { id: "cup_10", icon: "🏅", name: "10 Cups", condition: player => player.stats.cupsWon >= 10 },
  { id: "cup_25", icon: "🌟", name: "Cup Legend - 25 Cups", condition: player => player.stats.cupsWon >= 25 },

  { id: "first_mvp", icon: "⭐", name: "First MVP", condition: player => player.stats.mvps >= 1 },
  { id: "mvp_25", icon: "⭐", name: "25 MVPs", condition: player => player.stats.mvps >= 25 },
  { id: "mvp_50", icon: "⭐", name: "50 MVPs", condition: player => player.stats.mvps >= 50 },
  { id: "mvp_100", icon: "⚡", name: "MVP God - 100 MVPs", condition: player => player.stats.mvps >= 100 },

  { id: "points_1000", icon: "💯", name: "1000 Points", condition: player => player.stats.points >= 1000 },
  { id: "points_5000", icon: "🚀", name: "5000 Points", condition: player => player.stats.points >= 5000 },
  { id: "points_10000", icon: "💎", name: "10000 Points", condition: player => player.stats.points >= 10000 }
];

let state = null;
let selectedProfilePlayerId = null;

document.addEventListener("DOMContentLoaded", init);

function init() {
  state = loadData();
  calculateRankings(false);

  setupLogin();
  setupNavigation();
  setupPlayerActions();
  setupMatchActions();
  setupTournamentActions();
  setupCupActions();
  setupEventActions();
  setupHistoryTabs();
  setupAdminActions();

  if (sessionStorage.getItem(LOGIN_KEY) === "true") {
    showApp();
  } else {
    showLogin();
  }

  renderAll();
}

function createDefaultState() {
  return {
    password: DEFAULT_PASSWORD,
    players: DEFAULT_PLAYERS.map(createPlayer),
    matches: [],
    tournaments: [],
    cups: [],
    events: [],
    activeTournament: null,
    activeEvent: null,
    undoStack: [],
    createdAt: new Date().toISOString()
  };
}

function createPlayer(player) {
  const now = new Date().toISOString();

  return {
    id: player.id || Date.now(),
    name: player.name || "Player",
    username: player.username || "",
    nickname: player.nickname || "",
    image: player.image || "",
    joinDate: player.joinDate || now,
    stats: {
      matches: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      points: 0,
      mvps: 0,
      cupsWon: 0,
      tournamentsWon: 0,
      eventWins: 0,
      currentRank: 0,
      highestRank: 0,
      currentStreak: 0,
      longestStreak: 0
    },
    achievements: [],
    rankHistory: [],
    careerHistory: []
  };
}

function normalizePlayer(player) {
  const fresh = createPlayer(player);

  player.stats = {
    ...fresh.stats,
    ...(player.stats || {})
  };

  return {
    ...fresh,
    ...player,
    stats: player.stats,
    achievements: Array.isArray(player.achievements) ? player.achievements : [],
    rankHistory: Array.isArray(player.rankHistory) ? player.rankHistory : [],
    careerHistory: Array.isArray(player.careerHistory) ? player.careerHistory : []
  };
}

function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    const fresh = createDefaultState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    return fresh;
  }

  try {
    const parsed = JSON.parse(saved);

    return {
      password: parsed.password || DEFAULT_PASSWORD,
      players: Array.isArray(parsed.players) ? parsed.players.map(normalizePlayer) : DEFAULT_PLAYERS.map(createPlayer),
      matches: Array.isArray(parsed.matches) ? parsed.matches : [],
      tournaments: Array.isArray(parsed.tournaments) ? parsed.tournaments : [],
      cups: Array.isArray(parsed.cups) ? parsed.cups : [],
      events: Array.isArray(parsed.events) ? parsed.events : [],
      activeTournament: parsed.activeTournament || null,
      activeEvent: parsed.activeEvent || null,
      undoStack: Array.isArray(parsed.undoStack) ? parsed.undoStack : [],
      createdAt: parsed.createdAt || new Date().toISOString()
    };
  } catch (error) {
    console.error(error);
    return createDefaultState();
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function $(id) {
  return document.getElementById(id);
}

function getPlayer(playerId) {
  return state.players.find(player => Number(player.id) === Number(playerId));
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleString();
}

function winRate(player) {
  if (!player.stats.matches) return 0;
  return Number(((player.stats.wins / player.stats.matches) * 100).toFixed(1));
}

function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function pushUndo(label) {
  const snapshot = deepClone(state);
  snapshot.undoStack = [];

  state.undoStack.push({
    label,
    date: new Date().toISOString(),
    snapshot
  });

  if (state.undoStack.length > 20) {
    state.undoStack.shift();
  }
}

function toast(message) {
  const toastBox = $("toast");
  if (!toastBox) return;

  toastBox.textContent = message;
  toastBox.classList.add("show");

  setTimeout(() => {
    toastBox.classList.remove("show");
  }, 2500);
}

/* LOGIN */

function setupLogin() {
  const loginForm = $("loginForm");
  const logoutBtn = $("logoutBtn");

  if (loginForm) {
    loginForm.addEventListener("submit", event => {
      event.preventDefault();

      const passwordInput = $("adminPassword");

      if (!passwordInput) return;

      if (passwordInput.value === state.password) {
        sessionStorage.setItem(LOGIN_KEY, "true");
        passwordInput.value = "";
        showApp();
        toast("Admin login successful");
      } else {
        toast("Wrong password");
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.removeItem(LOGIN_KEY);
      showLogin();
    });
  }
}

function showLogin() {
  $("loginScreen").classList.remove("hidden");
  $("app").classList.add("hidden");
}

function showApp() {
  $("loginScreen").classList.add("hidden");
  $("app").classList.remove("hidden");
}

/* NAVIGATION */

function setupNavigation() {
  document.querySelectorAll(".nav-btn").forEach(button => {
    button.addEventListener("click", () => {
      openPage(button.dataset.page);
    });
  });

  const menuBtn = $("menuBtn");
  const sidebar = document.querySelector(".sidebar");

  if (menuBtn && sidebar) {
    menuBtn.addEventListener("click", () => {
      sidebar.classList.toggle("open");
    });
  }
}

function openPage(pageId) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active-page");
  });

  document.querySelectorAll(".nav-btn").forEach(button => {
    button.classList.remove("active");
  });

  const page = $(pageId);
  const button = document.querySelector(`.nav-btn[data-page="${pageId}"]`);

  if (page) page.classList.add("active-page");
  if (button) button.classList.add("active");

  const titleMap = {
    dashboard: ["Dashboard", "Live league overview"],
    players: ["Players", "Manage players and profiles"],
    match: ["Quick Match", "Record normal match results"],
    tournaments: ["Tournaments", "Create and manage tournament series"],
    cups: ["Cups", "League Cup and Elimination Cup"],
    events: ["Events", "Special event tournaments"],
    achievements: ["Achievements", "Titles and unlockable records"],
    records: ["Records", "All-time league records"],
    history: ["History", "Permanent match and champion records"],
    admin: ["Admin Panel", "Backup, restore and reset data"]
  };

  const pageInfo = titleMap[pageId] || ["Dashboard", "Live league overview"];

  $("pageTitle").textContent = pageInfo[0];
  $("pageSubtitle").textContent = pageInfo[1];

  const sidebar = document.querySelector(".sidebar");
  if (sidebar) sidebar.classList.remove("open");
}

/* RANKINGS */

function calculateRankings(recordHistory) {
  const rankedPlayers = [...state.players].sort((a, b) => {
    const rateDiff = winRate(b) - winRate(a);
    if (rateDiff !== 0) return rateDiff;

    const mvpDiff = b.stats.mvps - a.stats.mvps;
    if (mvpDiff !== 0) return mvpDiff;

    const matchDiff = b.stats.matches - a.stats.matches;
    if (matchDiff !== 0) return matchDiff;

    return new Date(a.joinDate) - new Date(b.joinDate);
  });

  rankedPlayers.forEach((player, index) => {
    const rank = index + 1;
    player.stats.currentRank = rank;

    if (!player.stats.highestRank || rank < player.stats.highestRank) {
      player.stats.highestRank = rank;
    }

    player.stats.winRate = winRate(player);

    if (recordHistory) {
      player.rankHistory.push({
        date: new Date().toISOString(),
        rank
      });

      if (player.rankHistory.length > 50) {
        player.rankHistory.shift();
      }
    }
  });
}

function getRankedPlayers() {
  return [...state.players].sort((a, b) => a.stats.currentRank - b.stats.currentRank);
}

function getTopByStat(statName) {
  const players = [...state.players].filter(player => Number(player.stats[statName]) > 0);

  if (!players.length) return null;

  players.sort((a, b) => {
    const diff = b.stats[statName] - a.stats[statName];
    if (diff !== 0) return diff;

    return new Date(a.joinDate) - new Date(b.joinDate);
  });

  return players[0];
}

function getSpecialTitles(player) {
  const titles = [];

  const hall = getTopByStat("tournamentsWon");
  const legend = getTopByStat("cupsWon");
  const mythic = getTopByStat("mvps");

  if (hall && hall.id === player.id) titles.push("🏛 Hall of Fame");
  if (legend && legend.id === player.id) titles.push("🌟 Legendary Player");
  if (mythic && mythic.id === player.id) titles.push("⚡ Mythic Master");

  return titles;
}

/* RENDER ALL */

function renderAll() {
  calculateRankings(false);

  renderDashboard();
  renderPlayers();
  renderSelectors();
  renderActiveTournament();
  renderActiveEvent();
  renderAchievements();
  renderRecords();
  renderHistory();
  renderCharts();

  if (selectedProfilePlayerId) {
    renderPlayerProfile(selectedProfilePlayerId);
  }

  saveData();
}

/* DASHBOARD */

function renderDashboard() {
  $("totalPlayers").textContent = state.players.length;
  $("totalMatches").textContent = state.matches.length;
  $("totalTournaments").textContent = state.tournaments.length;
  $("totalCups").textContent = state.cups.length;

  const rankedPlayers = getRankedPlayers();
  const topPlayer = rankedPlayers[0];

  $("topPlayer").innerHTML = topPlayer
    ? `
      <div class="champion">
        🏆 #1 ${topPlayer.name}<br>
        <small>Win Rate: ${winRate(topPlayer)}% | MVPs: ${topPlayer.stats.mvps}</small>
      </div>
    `
    : "No data yet";

  renderLeaderboard("mvpLeaderboard", [...state.players].sort((a, b) => b.stats.mvps - a.stats.mvps), player => `${player.stats.mvps} MVPs`);
  renderLeaderboard("winRateLeaderboard", rankedPlayers, player => `${winRate(player)}%`);
  renderLeaderboard("trophyLeaderboard", [...state.players].sort((a, b) => {
    const trophiesA = a.stats.cupsWon + a.stats.tournamentsWon;
    const trophiesB = b.stats.cupsWon + b.stats.tournamentsWon;
    return trophiesB - trophiesA;
  }), player => `${player.stats.tournamentsWon + player.stats.cupsWon} trophies`);

  renderSpecialTitles();
  renderRecentChampions();
}

function renderLeaderboard(containerId, players, valueGetter) {
  const container = $(containerId);
  if (!container) return;

  const top = players.slice(0, 5);

  if (!top.length) {
    container.innerHTML = `<p>No data yet</p>`;
    return;
  }

  container.innerHTML = top.map((player, index) => `
    <div class="leader-row">
      <span>#${index + 1} ${player.name}</span>
      <strong>${valueGetter(player)}</strong>
    </div>
  `).join("");
}

function renderSpecialTitles() {
  const container = $("specialTitles");
  if (!container) return;

  const hall = getTopByStat("tournamentsWon");
  const legend = getTopByStat("cupsWon");
  const mythic = getTopByStat("mvps");

  container.innerHTML = `
    <div class="title-row">
      <span>🏛 Hall of Fame</span>
      <strong>${hall ? hall.name : "Not awarded"}</strong>
    </div>

    <div class="title-row">
      <span>🌟 Legendary Player</span>
      <strong>${legend ? legend.name : "Not awarded"}</strong>
    </div>

    <div class="title-row">
      <span>⚡ Mythic Master</span>
      <strong>${mythic ? mythic.name : "Not awarded"}</strong>
    </div>
  `;
}

function renderRecentChampions() {
  const container = $("recentChampions");
  if (!container) return;

  const records = [
    ...state.tournaments.map(item => ({ ...item, type: "Tournament" })),
    ...state.cups.map(item => ({ ...item, type: "Cup" })),
    ...state.events.map(item => ({ ...item, type: "Event" }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);

  if (!records.length) {
    container.innerHTML = `<p>No champions yet</p>`;
    return;
  }

  container.innerHTML = records.map(record => `
    <div class="history-row">
      <span>${record.type}: ${record.name}</span>
      <strong>🏆 ${record.championName}</strong>
    </div>
  `).join("");
}

/* PLAYERS */

function setupPlayerActions() {
  const addPlayerBtn = $("addPlayerBtn");
  const closePlayerModalBtn = $("closePlayerModalBtn");
  const savePlayerBtn = $("savePlayerBtn");
  const closeProfileBtn = $("closeProfileBtn");

  if (addPlayerBtn) {
    addPlayerBtn.addEventListener("click", () => openPlayerModal());
  }

  if (closePlayerModalBtn) {
    closePlayerModalBtn.addEventListener("click", closePlayerModal);
  }

  if (savePlayerBtn) {
    savePlayerBtn.addEventListener("click", savePlayerFromModal);
  }

  if (closeProfileBtn) {
    closeProfileBtn.addEventListener("click", () => {
      selectedProfilePlayerId = null;
      $("playerProfile").classList.add("hidden");
    });
  }
}

function renderPlayers() {
  const container = $("playersGrid");
  if (!container) return;

  container.innerHTML = getRankedPlayers().map(player => {
    const initials = player.name.split(" ").map(part => part[0]).join("").slice(0, 2).toUpperCase();
    const titles = getSpecialTitles(player);

    return `
      <div class="player-card">
        <div class="player-avatar">${player.image ? `<img src="${player.image}" alt="${player.name}">` : initials}</div>
        <h3>${player.name}</h3>
        <p>@${player.username}</p>
        <p>Rank #${player.stats.currentRank} | Win Rate ${winRate(player)}%</p>
        <p>${titles.length ? titles.join(", ") : "No special title"}</p>

        <div class="player-actions">
          <button onclick="viewPlayer(${player.id})">View</button>
          <button onclick="editPlayer(${player.id})">Edit</button>
          <button onclick="deletePlayer(${player.id})">Delete</button>
        </div>
      </div>
    `;
  }).join("");
}

function openPlayerModal(player = null) {
  $("playerModal").classList.remove("hidden");

  if (player) {
    $("playerModalTitle").textContent = "Edit Player";
    $("editPlayerId").value = player.id;
    $("playerName").value = player.name;
    $("playerUsername").value = player.username;
    $("playerNickname").value = player.nickname || "";
    $("playerImage").value = player.image || "";
  } else {
    $("playerModalTitle").textContent = "Add Player";
    $("editPlayerId").value = "";
    $("playerName").value = "";
    $("playerUsername").value = "";
    $("playerNickname").value = "";
    $("playerImage").value = "";
  }
}

function closePlayerModal() {
  $("playerModal").classList.add("hidden");
}

function savePlayerFromModal() {
  const id = $("editPlayerId").value;
  const name = $("playerName").value.trim();
  const username = $("playerUsername").value.trim();
  const nickname = $("playerNickname").value.trim();
  const image = $("playerImage").value.trim();

  if (!name || !username) {
    toast("Name and username are required");
    return;
  }

  pushUndo(id ? "Edit player" : "Add player");

  if (id) {
    const player = getPlayer(id);
    if (!player) return;

    player.name = name;
    player.username = username;
    player.nickname = nickname;
    player.image = image;
  } else {
    state.players.push(createPlayer({
      id: Date.now(),
      name,
      username,
      nickname,
      image
    }));
  }

  closePlayerModal();
  renderAll();
  toast("Player saved");
}

window.viewPlayer = function(playerId) {
  selectedProfilePlayerId = playerId;
  renderPlayerProfile(playerId);
};

window.editPlayer = function(playerId) {
  const player = getPlayer(playerId);
  if (player) openPlayerModal(player);
};

window.deletePlayer = function(playerId) {
  const player = getPlayer(playerId);
  if (!player) return;

  const confirmed = confirm(`Delete ${player.name}? This will not remove old history records.`);

  if (!confirmed) return;

  pushUndo("Delete player");
  state.players = state.players.filter(item => item.id !== player.id);

  if (selectedProfilePlayerId === player.id) {
    selectedProfilePlayerId = null;
    $("playerProfile").classList.add("hidden");
  }

  renderAll();
  toast("Player deleted");
};

function renderPlayerProfile(playerId) {
  const player = getPlayer(playerId);
  if (!player) return;

  const panel = $("playerProfile");
  panel.classList.remove("hidden");

  $("profileName").textContent = player.name;
  $("profileUsername").textContent = `@${player.username}`;

  const titles = getSpecialTitles(player);

  $("profileStats").innerHTML = `
    ${profileStat("Current Rank", `#${player.stats.currentRank}`)}
    ${profileStat("Highest Rank", `#${player.stats.highestRank}`)}
    ${profileStat("Matches", player.stats.matches)}
    ${profileStat("Wins", player.stats.wins)}
    ${profileStat("Losses", player.stats.losses)}
    ${profileStat("Win Rate", `${winRate(player)}%`)}
    ${profileStat("Points", player.stats.points)}
    ${profileStat("MVPs", player.stats.mvps)}
    ${profileStat("Cups Won", player.stats.cupsWon)}
    ${profileStat("Tournaments Won", player.stats.tournamentsWon)}
    ${profileStat("Current Streak", player.stats.currentStreak)}
    ${profileStat("Longest Streak", player.stats.longestStreak)}
    ${profileStat("Special Title", titles.length ? titles.join(", ") : "None")}
  `;

  const unlocked = ACHIEVEMENTS.filter(achievement => player.achievements.includes(achievement.id));

  $("profileAchievements").innerHTML = unlocked.length
    ? unlocked.map(item => `<div class="achievement-row unlocked">${item.icon} ${item.name}</div>`).join("")
    : `<p>No achievements unlocked yet</p>`;

  $("profileHistory").innerHTML = player.careerHistory.length
    ? player.careerHistory.slice(0, 20).map(item => `
      <div class="history-item">
        <strong>${item.title}</strong>
        <p>${formatDate(item.date)}</p>
      </div>
    `).join("")
    : `<p>No career history yet</p>`;
}

function profileStat(label, value) {
  return `
    <div class="profile-stat">
      <span>${label}</span>
      <strong>${value}</strong>
    </div>
  `;
}

/* CHECKBOXES AND RESULT INPUTS */

function renderSelectors() {
  renderCheckboxList("matchPlayers", "matchPlayer");
  renderCheckboxList("tournamentPlayers", "tournamentPlayer");
  renderCheckboxList("leagueCupPlayers", "leagueCupPlayer");
  renderCheckboxList("eliminationCupPlayers", "eliminationPlayer");
  renderCheckboxList("eventPlayers", "eventPlayer");

  updateQuickMatchInputs();
  updateLeagueCupInputs();
  updateEliminationCupInputs();
}

function renderCheckboxList(containerId, prefix) {
  const container = $(containerId);
  if (!container) return;

  const selectedIds = getSelectedPlayers(containerId);
    if (!container) return [];

  return Array.from(container.querySelectorAll("input[type='checkbox']:checked")).map(input => Number(input.value));
}

function renderResultInputs(containerId, playerIds, mapsCount, prefix) {
  const container = $(containerId);
  if (!container) return;

  if (!playerIds.length) {
    container.innerHTML = `<p>Select players first</p>`;
    return;
  }

  container.innerHTML = playerIds.map(playerId => {
    const player = getPlayer(playerId);
    if (!player) return "";

    const inputs = Array.from({ length: mapsCount }, (_, index) => `
      <input
        type="number"
        min="1"
        max="${playerIds.length}"
        placeholder="M${index + 1}"
        data-result-prefix="${prefix}"
        data-player-id="${player.id}"
        data-map="${index}"
      >
    `).join("");

    return `
      <div class="result-row" style="grid-template-columns: 1fr repeat(${mapsCount}, 75px);">
        <span>${player.name}</span>
        ${inputs}
      </div>
    `;
  }).join("");
}
function readResultInputs(containerId, playerIds, mapsCount, prefix) {
  const mapPositions = {};

  playerIds.forEach(playerId => {
    mapPositions[playerId] = [];

    for (let mapIndex = 0; mapIndex < mapsCount; mapIndex++) {
      const input = document.querySelector(`[data-result-prefix="${prefix}"][data-player-id="${playerId}"][data-map="${mapIndex}"]`);

      if (!input || input.value === "") {
        throw new Error("Please enter all map positions");
      }

      const position = Number(input.value);

      if (!Number.isInteger(position) || position < 1 || position > playerIds.length) {
        throw new Error(`Positions must be from 1 to ${playerIds.length}`);
      }

      mapPositions[playerId].push(position);
    }
  });

  validateUniquePositions(playerIds, mapPositions, mapsCount);

  return mapPositions;
}

function validateUniquePositions(playerIds, mapPositions, mapsCount) {
  for (let mapIndex = 0; mapIndex < mapsCount; mapIndex++) {
    const used = new Set();

    playerIds.forEach(playerId => {
      const position = Number(mapPositions[playerId][mapIndex]);

      if (used.has(position)) {
        throw new Error(`Map ${mapIndex + 1} has duplicate positions`);
      }

      used.add(position);
    });
  }
}

/* MATCH ENGINE */
function calculateMatchResult(playerIds, mapPositions, mapsCount) {
  validateUniquePositions(playerIds, mapPositions, mapsCount);

  const entries = playerIds.map(playerId => {
    const player = getPlayer(playerId);
    const positions = mapPositions[playerId];
    let totalPoints = 0;
    const placeCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    positions.forEach(position => {
      totalPoints += SCORE_TABLE[position] || 0;
      placeCounts[position] += 1;
    });

    return {
      playerId,
      playerName: player ? player.name : "Unknown Player",
      totalPoints,
      positions,
      placeCounts
    };
  });

  entries.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    if (b.placeCounts[1] !== a.placeCounts[1]) return b.placeCounts[1] - a.placeCounts[1];
    if (b.placeCounts[2] !== a.placeCounts[2]) return b.placeCounts[2] - a.placeCounts[2];
    return a.playerName.localeCompare(b.playerName);
  });

  return {
    winnerId: entries[0].playerId,
    winnerName: entries[0].playerName,
    entries
  };
}
function processMatch(options) {
  const {
    name,
    type,
    playerIds,
    mapsCount,
    mapPositions,
    context = {},
    pushUndoBefore = true
  } = options;

  if (pushUndoBefore) {
    pushUndo(`Save ${type}`);
  }

  const result = calculateMatchResult(playerIds, mapPositions, mapsCount);
  const matchId = generateId("match");

  result.entries.forEach(entry => {
    const player = getPlayer(entry.playerId);
    if (!player) return;

    player.stats.matches += 1;
    player.stats.points += entry.totalPoints;

    if (entry.playerId === result.winnerId) {
      player.stats.wins += 1;
      player.stats.mvps += 1;
      player.stats.currentStreak += 1;

      if (player.stats.currentStreak > player.stats.longestStreak) {
        player.stats.longestStreak = player.stats.currentStreak;
      }
    } else {
      player.stats.losses += 1;
      player.stats.currentStreak = 0;
    }
      player.careerHistory.unshift({
      id: generateId("career"),
      date: new Date().toISOString(),
      title: `${type}: ${name} - ${entry.playerId === result.winnerId ? "Winner" : "Played"}`
    });

    if (player.careerHistory.length > 100) {
      player.careerHistory.pop();
    }
  });

  const matchRecord = {
    id: matchId,
    date: new Date().toISOString(),
    name,
    type,
    playerIds,
    mapsCount,
    winnerId: result.winnerId,
    winnerName: result.winnerName,
    entries: result.entries,
    mapPositions,
    context
  };

  state.matches.unshift(matchRecord);

  playerIds.forEach(playerId => {
    const player = getPlayer(playerId);
    if (player) updateAchievements(player);
  });
    calculateRankings(true);

  return {
    matchRecord,
    result
  };
}

/* QUICK MATCH */

function setupMatchActions() {
  const matchPlayers = $("matchPlayers");
  const matchMaps = $("matchMaps");
  const saveMatchBtn = $("saveMatchBtn");

  if (matchPlayers) {
    matchPlayers.addEventListener("change", updateQuickMatchInputs);
  }

  if (matchMaps) {
    matchMaps.addEventListener("input", updateQuickMatchInputs);
  }

  if (saveMatchBtn) {
    saveMatchBtn.addEventListener("click", saveQuickMatch);
  }
}

function updateQuickMatchInputs() {
  const playerIds = getSelectedPlayers("matchPlayers");
  const mapsCount = Number($("matchMaps")?.value || 3);

  renderResultInputs("matchResults", playerIds, mapsCount, "quickMatch");
}
function saveQuickMatch() {
  try {
    const playerIds = getSelectedPlayers("matchPlayers");
    const mapsCount = Number($("matchMaps").value);
    const name = $("matchName").value.trim() || "Quick Match";

    if (playerIds.length < 2 || playerIds.length > 5) {
      toast("Select 2 to 5 players");
      return;
    }

    if (mapsCount < 3 || mapsCount > 10) {
      toast("Maps must be between 3 and 10");
      return;
    }

    const mapPositions = readResultInputs("matchResults", playerIds, mapsCount, "quickMatch");

    const saved = processMatch({
      name,
      type: "Quick Match",
      playerIds,
      mapsCount,
      mapPositions
    });

    renderAll();
    toast(`Winner: ${saved.result.winnerName}`);
  } catch (error) {
    toast(error.message);
  }
}
/* TOURNAMENTS */

function setupTournamentActions() {
  const createTournamentBtn = $("createTournamentBtn");
  const saveTournamentMatchBtn = $("saveTournamentMatchBtn");
  const endTournamentBtn = $("endTournamentBtn");

  if (createTournamentBtn) {
    createTournamentBtn.addEventListener("click", createTournament);
  }

  if (saveTournamentMatchBtn) {
    saveTournamentMatchBtn.addEventListener("click", saveTournamentMatch);
  }

  if (endTournamentBtn) {
    endTournamentBtn.addEventListener("click", () => finishTournament(true));
  }
}

function createTournament() {
  const name = $("tournamentName").value.trim();
  const seriesLength = Number($("seriesLength").value);
  const mapsPerMatch = Number($("mapsPerMatch").value);
  const playerIds = getSelectedPlayers("tournamentPlayers");

  if (!name) {
    toast("Tournament name required");
    return;
  }

  if (playerIds.length < 2 || playerIds.length > 5) {
    toast("Tournament needs 2 to 5 players");
    return;
  }

  if (seriesLength < 3 || seriesLength > 10 || mapsPerMatch < 3 || mapsPerMatch > 10) {
    toast("Series and maps must be between 3 and 10");
    return;
  }
    if (state.activeTournament && !confirm("Replace current active tournament?")) {
    return;
  }

  pushUndo("Create tournament");

  state.activeTournament = {
    id: generateId("tournament"),
    name,
    playerIds,
    seriesLength,
    mapsPerMatch,
    matchNumber: 1,
    standings: playerIds.map(playerId => ({
      playerId,
      matchWins: 0,
      totalPoints: 0
    })),
    matchIds: [],
    startedAt: new Date().toISOString()
  };

  renderAll();
  toast("Tournament created");
}

function renderActiveTournament() {
  const active = state.activeTournament;
  const info = $("activeTournamentInfo");
  const standings = $("tournamentStandings");

  if (!info || !standings) return;

  if (!active) {
    info.textContent = "No active tournament";
    standings.innerHTML = "";
    $("tournamentMatchResults").innerHTML = "";
    return;
  }
    info.textContent = `${active.name} | Match ${active.matchNumber} of ${active.seriesLength}`;

  standings.innerHTML = renderStandings(active.standings);

  renderResultInputs(
    "tournamentMatchResults",
    active.playerIds,
    active.mapsPerMatch,
    "tournamentMatch"
  );
}

function renderStandings(standings) {
  const sorted = [...standings].sort((a, b) => {
    if (b.matchWins !== a.matchWins) return b.matchWins - a.matchWins;
    return b.totalPoints - a.totalPoints;
  });

  return `
    <div class="table-row">
      <span>Rank</span>
      <span>Player</span>
      <span>Wins</span>
      <span>Points</span>
    </div>
    ${sorted.map((row, index) => {
      const player = getPlayer(row.playerId);

      return `
        <div class="table-row">
          <span>#${index + 1}</span>
          <span>${player ? player.name : "Unknown"}</span>
          <span>${row.matchWins}</span>
          <span>${row.totalPoints}</span>
        </div>
      `;
    }).join("")}
  `;
}

function saveTournamentMatch() {
  try {
    const active = state.activeTournament;

    if (!active) {
      toast("No active tournament");
      return;
    }
      const mapPositions = readResultInputs(
      "tournamentMatchResults",
      active.playerIds,
      active.mapsPerMatch,
      "tournamentMatch"
    );

    pushUndo("Save tournament match");

    const saved = processMatch({
      name: `${active.name} - Match ${active.matchNumber}`,
      type: "Tournament",
      playerIds: active.playerIds,
      mapsCount: active.mapsPerMatch,
      mapPositions,
      context: {
        tournamentId: active.id
      },
      pushUndoBefore: false
    });

    active.matchIds.push(saved.matchRecord.id);

    saved.result.entries.forEach(entry => {
      const standing = active.standings.find(row => row.playerId === entry.playerId);
      if (!standing) return;

      standing.totalPoints += entry.totalPoints;

      if (entry.playerId === saved.result.winnerId) {
        standing.matchWins += 1;
      }
    });

    active.matchNumber += 1;

    if (active.matchNumber > active.seriesLength) {
      finishTournament(false);
      toast(`Tournament champion: ${saved.result.winnerName}`);
      return;
    }

    renderAll();
    toast(`Match winner: ${saved.result.winnerName}`);
  } catch (error) {
    toast(error.message);
      }
}

function finishTournament(pushUndoBefore) {
  const active = state.activeTournament;
  if (!active) return;

  if (pushUndoBefore) {
    pushUndo("End tournament");
  }

  const sorted = [...active.standings].sort((a, b) => {
    if (b.matchWins !== a.matchWins) return b.matchWins - a.matchWins;
    return b.totalPoints - a.totalPoints;
  });

  const championId = sorted[0].playerId;
  const champion = getPlayer(championId);

  if (champion) {
    champion.stats.tournamentsWon += 1;
    champion.careerHistory.unshift({
      id: generateId("career"),
      date: new Date().toISOString(),
      title: `🏆 Tournament Champion: ${active.name}`
    });
    updateAchievements(champion);
  }
    state.tournaments.unshift({
    id: active.id,
    date: new Date().toISOString(),
    name: active.name,
    championId,
    championName: champion ? champion.name : "Unknown",
    playerIds: active.playerIds,
    standings: sorted,
    matchIds: active.matchIds
  });

  state.activeTournament = null;
  renderAll();
  toast(`Tournament ended. Champion: ${champion ? champion.name : "Unknown"}`);
}

/* CUPS */

function setupCupActions() {
  const leagueCupPlayers = $("leagueCupPlayers");
  const leagueCupMaps = $("leagueCupMaps");
  const saveLeagueCupBtn = $("saveLeagueCupBtn");

  const eliminationCupPlayers = $("eliminationCupPlayers");
  const eliminationCupMaps = $("eliminationCupMaps");
  const saveEliminationCupBtn = $("saveEliminationCupBtn");

  if (leagueCupPlayers) leagueCupPlayers.addEventListener("change", updateLeagueCupInputs);
  if (leagueCupMaps) leagueCupMaps.addEventListener("input", updateLeagueCupInputs);
  if (saveLeagueCupBtn) saveLeagueCupBtn.addEventListener("click", saveLeagueCup);

  if (eliminationCupPlayers) eliminationCupPlayers.addEventListener("change", updateEliminationCupInputs);
  if (eliminationCupMaps) eliminationCupMaps.addEventListener("input", updateEliminationCupInputs);
  if (saveEliminationCupBtn) saveEliminationCupBtn.addEventListener("click", saveEliminationCup);

  const qualifierResults = $("qualifierResults");
  if (qualifierResults) {
    qualifierResults.addEventListener("input", updateEliminationFinalInputs);
  }
}
function updateLeagueCupInputs() {
  const playerIds = getSelectedPlayers("leagueCupPlayers");
  const mapsCount = Number($("leagueCupMaps")?.value || 3);

  renderResultInputs("leagueCupResults", playerIds, mapsCount, "leagueCup");
}

function saveLeagueCup() {
  try {
    const name = $("leagueCupName").value.trim() || "League Cup";
    const playerIds = getSelectedPlayers("leagueCupPlayers");
    const mapsCount = Number($("leagueCupMaps").value);

    if (playerIds.length < 2 || playerIds.length > 5) {
      toast("League Cup needs 2 to 5 players");
      return;
    }

    const mapPositions = readResultInputs("leagueCupResults", playerIds, mapsCount, "leagueCup");

    pushUndo("Save League Cup");

    const saved = processMatch({
      name,
      type: "League Cup",
      playerIds,
      mapsCount,
      mapPositions,
      pushUndoBefore: false
    });

    const champion = getPlayer(saved.result.winnerId);

    if (champion) {
      champion.stats.cupsWon += 1;
      champion.careerHistory.unshift({
        id: generateId("career"),
        date: new Date().toISOString(),
        title: `🥇 League Cup Champion: ${name}`
      });
      updateAchievements(champion);
    }
      state.cups.unshift({
      id: generateId("cup"),
      date: new Date().toISOString(),
      name,
      type: "League Cup",
      championId: saved.result.winnerId,
      championName: saved.result.winnerName,
      playerIds,
      matchId: saved.matchRecord.id
    });

    renderAll();
    toast(`League Cup champion: ${saved.result.winnerName}`);
  } catch (error) {
    toast(error.message);
  }
}

function updateEliminationCupInputs() {
  const playerIds = getSelectedPlayers("eliminationCupPlayers");
  const mapsCount = Number($("eliminationCupMaps")?.value || 3);

  renderResultInputs("qualifierResults", playerIds, mapsCount, "elimQualifier");
  updateEliminationFinalInputs();
}

function updateEliminationFinalInputs() {
  const playerIds = getSelectedPlayers("eliminationCupPlayers");
  const mapsCount = Number($("eliminationCupMaps")?.value || 3);
  const finalContainer = $("finalResults");

  if (!finalContainer) return;

  if (playerIds.length !== 4) {
    finalContainer.innerHTML = `<p>Select exactly 4 players for Elimination Cup</p>`;
    return;
  }

  try {
    const qualifierPositions = readResultInputs("qualifierResults", playerIds, mapsCount, "elimQualifier");
    const qualifierResult = calculateMatchResult(playerIds, qualifierPositions, mapsCount);
    const finalists = qualifierResult.entries.slice(0, 2).map(entry => entry.playerId);

    renderResultInputs("finalResults", finalists, mapsCount, "elimFinal");
  } catch (error) {
    finalContainer.innerHTML = `<p>Complete qualifier result to unlock final match</p>`;
  }
}
function saveEliminationCup() {
  try {
    const name = $("eliminationCupName").value.trim() || "Elimination Cup";
    const playerIds = getSelectedPlayers("eliminationCupPlayers");
    const mapsCount = Number($("eliminationCupMaps").value);

    if (playerIds.length !== 4) {
      toast("Elimination Cup needs exactly 4 players");
      return;
    }

    const qualifierPositions = readResultInputs("qualifierResults", playerIds, mapsCount, "elimQualifier");
    const qualifierResult = calculateMatchResult(playerIds, qualifierPositions, mapsCount);
    const finalists = qualifierResult.entries.slice(0, 2).map(entry => entry.playerId);

    const finalPositions = readResultInputs("finalResults", finalists, mapsCount, "elimFinal");

    pushUndo("Save Elimination Cup");

    const qualifierSaved = processMatch({
      name: `${name} - Qualifier`,
      type: "Elimination Cup Qualifier",
      playerIds,
      mapsCount,
      mapPositions: qualifierPositions,
      pushUndoBefore: false
    });

    const finalSaved = processMatch({
      name: `${name} - Final`,
      type: "Elimination Cup Final",
      playerIds: finalists,
      mapsCount,
      mapPositions: finalPositions,
      pushUndoBefore: false
    });
      const champion = getPlayer(finalSaved.result.winnerId);

    if (champion) {
      champion.stats.cupsWon += 1;
      champion.careerHistory.unshift({
        id: generateId("career"),
        date: new Date().toISOString(),
        title: `⚔️ Elimination Cup Champion: ${name}`
      });
      updateAchievements(champion);
    }

    state.cups.unshift({
      id: generateId("cup"),
      date: new Date().toISOString(),
      name,
      type: "Elimination Cup",
      championId: finalSaved.result.winnerId,
      championName: finalSaved.result.winnerName,
      playerIds,
      finalists,
      qualifierMatchId: qualifierSaved.matchRecord.id,
      finalMatchId: finalSaved.matchRecord.id
    });

    renderAll();
    toast(`Elimination Cup champion: ${finalSaved.result.winnerName}`);
  } catch (error) {
    toast(error.message);
  }
}


/* EVENTS */

function setupEventActions() {
  const createEventBtn = $("createEventBtn");
  const saveEventMatchBtn = $("saveEventMatchBtn");
  const endEventBtn = $("endEventBtn");

  if (createEventBtn) createEventBtn.addEventListener("click", createEventTournament);
  if (saveEventMatchBtn) saveEventMatchBtn.addEventListener("click", saveEventMatch);
  if (endEventBtn) endEventBtn.addEventListener("click", () => finishEvent(true));
}

function createEventTournament() {
  const name = $("eventName").value.trim();
  const seriesLength = Number($("eventSeriesLength").value);
  const mapsPerMatch = Number($("eventMapsPerMatch").value);
  const playerIds = getSelectedPlayers("eventPlayers");

  if (!name) {
    toast("Event name required");
    return;
  }

  if (playerIds.length < 2 || playerIds.length > 5) {
    toast("Event needs 2 to 5 players");
    return;
  }

  if (seriesLength < 3 || seriesLength > 10 || mapsPerMatch < 3 || mapsPerMatch > 10) {
    toast("Series and maps must be between 3 and 10");
    return;
  }
    if (state.activeEvent && !confirm("Replace current active event?")) {
    return;
  }

  pushUndo("Create event");

  state.activeEvent = {
    id: generateId("event"),
    name,
    playerIds,
    seriesLength,
    mapsPerMatch,
    matchNumber: 1,
    standings: playerIds.map(playerId => ({
      playerId,
      matchWins: 0,
      totalPoints: 0
    })),
    matchIds: [],
    startedAt: new Date().toISOString()
  };
    renderAll();
  toast("Event tournament created");
}

function renderActiveEvent() {
  const active = state.activeEvent;
  const info = $("activeEventInfo");
  const standings = $("eventStandings");

  if (!info || !standings) return;

  if (!active) {
    info.textContent = "No active event";
    standings.innerHTML = "";
    $("eventMatchResults").innerHTML = "";
    return;
  }

  info.textContent = `${active.name} | Match ${active.matchNumber} of ${active.seriesLength}`;
  standings.innerHTML = renderStandings(active.standings);

  renderResultInputs(
    "eventMatchResults",
    active.playerIds,
    active.mapsPerMatch,
    "eventMatch"
  );
}

function saveEventMatch() {
  try {
    const active = state.activeEvent;

    if (!active) {
      toast("No active event");
      return;
    }
     const mapPositions = readResultInputs(
      "eventMatchResults",
      active.playerIds,
      active.mapsPerMatch,
      "eventMatch"
    );

    pushUndo("Save event match");

    const saved = processMatch({
      name: `${active.name} - Match ${active.matchNumber}`,
      type: "Event Tournament",
      playerIds: active.playerIds,
      mapsCount: active.mapsPerMatch,
      mapPositions,
      context: {
        eventId: active.id
      },
      pushUndoBefore: false
    });

    active.matchIds.push(saved.matchRecord.id);

    saved.result.entries.forEach(entry => {
      const standing = active.standings.find(row => row.playerId === entry.playerId);
      if (!standing) return;

      standing.totalPoints += entry.totalPoints;

      if (entry.playerId === saved.result.winnerId) {
        standing.matchWins += 1;
      } 
    });

    active.matchNumber += 1;

    if (active.matchNumber > active.seriesLength) {
      finishEvent(false);
      return;
    }

    renderAll();
    toast(`Event match winner: ${saved.result.winnerName}`);
  } catch (error) {
    toast(error.message);
  }
}

function finishEvent(pushUndoBefore) {
  const active = state.activeEvent;
  if (!active) return;

  if (pushUndoBefore) {
    pushUndo("End event");
  }

  const sorted = [...active.standings].sort((a, b) => {
    if (b.matchWins !== a.matchWins) return b.matchWins - a.matchWins;
    return b.totalPoints - a.totalPoints;
  });
    const championId = sorted[0].playerId;
  const champion = getPlayer(championId);

  if (champion) {
    champion.stats.eventWins += 1;
    champion.careerHistory.unshift({
      id: generateId("career"),
      date: new Date().toISOString(),
      title: `🎉 Event Champion: ${active.name}`
    });
    updateAchievements(champion);
  }

  state.events.unshift({
    id: active.id,
    date: new Date().toISOString(),
    name: active.name,
    championId,
    championName: champion ? champion.name : "Unknown",
    playerIds: active.playerIds,
    standings: sorted,
    matchIds: active.matchIds
  });
    state.activeEvent = null;
  renderAll();
  toast(`Event ended. Champion: ${champion ? champion.name : "Unknown"}`);
}

/* ACHIEVEMENTS */

function updateAchievements(player) {
  ACHIEVEMENTS.forEach(achievement => {
    if (achievement.condition(player) && !player.achievements.includes(achievement.id)) {
      player.achievements.push(achievement.id);
    }
  });
}

function renderAchievements() {
  const dynamicTitles = $("dynamicTitles");
  const achievementList = $("achievementList");

  if (dynamicTitles) {
    const hall = getTopByStat("tournamentsWon");
    const legend = getTopByStat("cupsWon");
    const mythic = getTopByStat("mvps");

    dynamicTitles.innerHTML = `
      <div class="title-row">
        <span>🏛 Hall of Fame</span>
        <strong>${hall ? hall.name : "Not awarded"}</strong>
      </div>

      <div class="title-row">
        <span>🌟 Legendary Player</span>
        <strong>${legend ? legend.name : "Not awarded"}</strong>
      </div>
      <div class="title-row">
        <span>⚡ Mythic Master</span>
        <strong>${mythic ? mythic.name : "Not awarded"}</strong>
      </div>
    `;
  }

  if (achievementList) {
    achievementList.innerHTML = ACHIEVEMENTS.map(achievement => {
      const unlockedBy = state.players.filter(player => player.achievements.includes(achievement.id));

      return `
        <div class="achievement-row ${unlockedBy.length ? "unlocked" : "locked"}">
          <span>${achievement.icon} ${achievement.name}</span>
          <strong>${unlockedBy.length} unlocked</strong>
        </div>
      `;
    }).join("");
  }
}

/* RECORDS */

function renderRecords() {
  const container = $("recordsGrid");
  if (!container) return;

  const mostTournamentWins = getTopByStat("tournamentsWon");
  const mostCupWins = getTopByStat("cupsWon");
  const mostMVPs = getTopByStat("mvps");
  const longestStreak = getTopByStat("longestStreak");
  const mostPoints = getTopByStat("points");
  const mostMatches = getTopByStat("matches");

  const highestWinRate = [...state.players]
    .filter(player => player.stats.matches > 0)
    .sort((a, b) => winRate(b) - winRate(a))[0];
    const records = [
    ["Most Tournament Wins", mostTournamentWins, mostTournamentWins ? mostTournamentWins.stats.tournamentsWon : 0],
    ["Most Cup Wins", mostCupWins, mostCupWins ? mostCupWins.stats.cupsWon : 0],
    ["Most MVPs", mostMVPs, mostMVPs ? mostMVPs.stats.mvps : 0],
    ["Highest Win Rate", highestWinRate, highestWinRate ? `${winRate(highestWinRate)}%` : "0%"],
    ["Longest Win Streak", longestStreak, longestStreak ? longestStreak.stats.longestStreak : 0],
    ["Most Points Earned", mostPoints, mostPoints ? mostPoints.stats.points : 0],
    ["Most Matches Played", mostMatches, mostMatches ? mostMatches.stats.matches : 0]
  ];

  container.innerHTML = records.map(record => `
    <div class="record-card">
      <span>${record[0]}</span>
      <strong>${record[1] ? record[1].name : "No holder"}</strong>
      <p>${record[2]}</p>
    </div>
  `).join("");
}

/* HISTORY */

function setupHistoryTabs() {
  document.querySelectorAll(".history-btn").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".history-btn").forEach(item => item.classList.remove("active"));
      document.querySelectorAll(".history-section").forEach(item => item.classList.remove("active-history"));

      button.classList.add("active");

      const panel = $(button.dataset.history);
      if (panel) panel.classList.add("active-history");
    });
  });
}
function renderHistory() {
  renderMatchHistory();
  renderTournamentHistory();
  renderCupHistory();
  renderEventHistory();
}

function renderMatchHistory() {
  const container = $("matchHistory");
  if (!container) return;

  if (!state.matches.length) {
    container.innerHTML = `<p>No match history yet</p>`;
    return;
  }

  container.innerHTML = state.matches.map(match => `
    <div class="history-item">
      <strong>${match.type}: ${match.name}</strong>
      <p>Winner: 🏆 ${match.winnerName}</p>
      <p>${formatDate(match.date)}</p>
    </div>
  `).join("");
}

function renderTournamentHistory() {
  const container = $("tournamentHistory");
  if (!container) return;

  if (!state.tournaments.length) {
    container.innerHTML = `<p>No tournament history yet</p>`;
    return;
  }

  container.innerHTML = state.tournaments.map(tournament => `
    <div class="history-item">
      <strong>🏆 ${tournament.name}</strong>
      <p>Champion: ${tournament.championName}</p>
      <p>${formatDate(tournament.date)}</p>
    </div>
  `).join("");
}
function renderCupHistory() {
  const container = $("cupHistory");
  if (!container) return;

  if (!state.cups.length) {
    container.innerHTML = `<p>No cup history yet</p>`;
    return;
  }

  container.innerHTML = state.cups.map(cup => `
    <div class="history-item">
      <strong>${cup.type}: ${cup.name}</strong>
      <p>Champion: ${cup.championName}</p>
      <p>${formatDate(cup.date)}</p>
    </div>
  `).join("");
}

function renderEventHistory() {
  const container = $("eventHistory");
  if (!container) return;

  if (!state.events.length) {
    container.innerHTML = `<p>No event history yet</p>`;
    return;
  }

  container.innerHTML = state.events.map(event => `
    <div class="history-item">
      <strong>🎉 ${event.name}</strong>
      <p>Champion: ${event.championName}</p>
      <p>${formatDate(event.date)}</p>
    </div>
  `).join("");
}
/* ADMIN */

function setupAdminActions() {
  const exportBackupBtn = $("exportBackupBtn");
  const restoreBackupInput = $("restoreBackupInput");
  const changePasswordBtn = $("changePasswordBtn");
  const undoLastBtn = $("undoLastBtn");
  const resetDataBtn = $("resetDataBtn");

  if (exportBackupBtn) exportBackupBtn.addEventListener("click", exportBackup);
  if (restoreBackupInput) restoreBackupInput.addEventListener("change", restoreBackup);
  if (changePasswordBtn) changePasswordBtn.addEventListener("click", changePassword);
  if (undoLastBtn) undoLastBtn.addEventListener("click", undoLastAction);
  if (resetDataBtn) resetDataBtn.addEventListener("click", resetAllData);
}

function exportBackup() {
  const blob = new Blob([JSON.stringify(state, null, 2)], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `stumble-league-backup-${Date.now()}.json`;
  link.click();

  URL.revokeObjectURL(url);
  toast("Backup exported");
}
function restoreBackup(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);

      if (!Array.isArray(parsed.players)) {
        toast("Invalid backup file");
        return;
      }

      pushUndo("Restore backup");
      state = {
        ...createDefaultState(),
        ...parsed,
        players: parsed.players.map(normalizePlayer),
        undoStack: state.undoStack
      };

      renderAll();
      toast("Backup restored");
    } catch (error) {
      toast("Could not restore backup");
    }
  };

  reader.readAsText(file);
}
function changePassword() {
  const oldPassword = $("oldPassword").value;
  const newPassword = $("newPassword").value;

  if (oldPassword !== state.password) {
    toast("Old password is wrong");
    return;
  }

  if (!newPassword || newPassword.length < 4) {
    toast("New password must be at least 4 characters");
    return;
  }

  pushUndo("Change password");
  state.password = newPassword;

  $("oldPassword").value = "";
  $("newPassword").value = "";

  renderAll();
  toast("Password changed");
}

function undoLastAction() {
  if (!state.undoStack.length) {
    toast("Nothing to undo");
    return;
  }

  const last = state.undoStack.pop();

  if (!last || !last.snapshot) {
    toast("Undo failed");
    return;
  }

  const remainingUndo = state.undoStack;
  state = last.snapshot;
  state.undoStack = remainingUndo;

  renderAll();
  toast(`Undone: ${last.label}`);
      }
function resetAllData() {
  const confirmed = confirm("Reset all saved data? This cannot be undone unless you exported a backup.");

  if (!confirmed) return;

  pushUndo("Reset all data");
  state = createDefaultState();
  saveData();
  renderAll();
  toast("All data reset");
}

/* CHARTS */

function renderCharts() {
  const players = getRankedPlayers();

  drawBarChart("pointsChart", players.map(player => player.name), players.map(player => player.stats.points));
  drawBarChart("winsChart", players.map(player => player.name), players.map(player => player.stats.wins));
  drawBarChart("mvpChart", players.map(player => player.name), players.map(player => player.stats.mvps));

  const topPlayer = players[0];
  drawRankChart("rankChart", topPlayer);
}

function drawBarChart(canvasId, labels, values) {
  const canvas = $(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const width = canvas.clientWidth || 400;
  const height = 220;
  const ratio = window.devicePixelRatio || 1;

  canvas.width = width * ratio;
  canvas.height = height * ratio;
  ctx.scale(ratio, ratio);

  ctx.clearRect(0, 0, width, height);
  const max = Math.max(...values, 1);
  const padding = 35;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const barWidth = labels.length ? chartWidth / labels.length - 10 : 20;

  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.font = "12px Arial";

  labels.forEach((label, index) => {
    const value = values[index];
    const barHeight = (value / max) * chartHeight;
    const x = padding + index * (barWidth + 10);
    const y = height - padding - barHeight;

    const gradient = ctx.createLinearGradient(0, y, 0, height - padding);
    gradient.addColorStop(0, "#ffd166");
    gradient.addColorStop(1, "#7c3cff");

    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, barWidth, barHeight);

    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.fillText(String(value), x, y - 6);

    ctx.save();
    ctx.translate(x + 4, height - 12);
    ctx.rotate(-0.4);
    ctx.fillText(label.slice(0, 8), 0, 0);
    ctx.restore();
  });
}
function drawRankChart(canvasId, player) {
  const canvas = $(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const width = canvas.clientWidth || 400;
  const height = 220;
  const ratio = window.devicePixelRatio || 1;

  canvas.width = width * ratio;
  canvas.height = height * ratio;
  ctx.scale(ratio, ratio);

  ctx.clearRect(0, 0, width, height);

  if (!player || !player.rankHistory.length) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.font = "14px Arial";
    ctx.fillText("Rank history will appear after matches", 25, 110);
    return;
  }

  const history = player.rankHistory.slice(-12);
  const padding = 35;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const maxRank = Math.max(...history.map(item => item.rank), 5);

  ctx.strokeStyle = "#ffd166";
  ctx.lineWidth = 3;
  ctx.beginPath();

  history.forEach((item, index) => {
    const x = padding + (index / Math.max(history.length - 1, 1)) * chartWidth;
    const y = padding + ((item.rank - 1) / Math.max(maxRank - 1, 1)) * chartHeight;

    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();

  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.font = "13px Arial";
  ctx.fillText(`${player.name} Rank History`, padding, 20);
}
