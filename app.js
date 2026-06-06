// =====================================
// STUMBLE LEAGUE MANAGER PRO
// CORE DATABASE
// =====================================

const defaultPlayers = [
{
id:1,
name:"Sankalp",
username:"sankalp_op",
nickname:"",
matches:0,
wins:0,
losses:0,
points:0,
mvp:0,
cupsWon:0,
tournamentsWon:0,
currentRank:0,
highestRank:0,
currentStreak:0,
longestStreak:0,
achievements:[]
},
{
id:2,
name:"Akshat Rakesh",
username:"terrorbebu",
nickname:"",
matches:0,
wins:0,
losses:0,
points:0,
mvp:0,
cupsWon:0,
tournamentsWon:0,
currentRank:0,
highestRank:0,
currentStreak:0,
longestStreak:0,
achievements:[]
},
{
id:3,
name:"Atharva Mishra",
username:"panditdabang",
nickname:"",
matches:0,
wins:0,
losses:0,
points:0,
mvp:0,
cupsWon:0,
tournamentsWon:0,
currentRank:0,
highestRank:0,
currentStreak:0,
longestStreak:0,
achievements:[]
},
{
id:4,
name:"Nayan Mehrotra",
username:"nbot",
nickname:"",
matches:0,
wins:0,
losses:0,
points:0,
mvp:0,
cupsWon:0,
tournamentsWon:0,
currentRank:0,
highestRank:0,
currentStreak:0,
longestStreak:0,
achievements:[]
},
{
id:5,
name:"Yugank Dwivedi",
username:"yuggu",
nickname:"",
matches:0,
wins:0,
losses:0,
points:0,
mvp:0,
cupsWon:0,
tournamentsWon:0,
currentRank:0,
highestRank:0,
currentStreak:0,
longestStreak:0,
achievements:[]
}
];

// =====================================
// DATABASE INIT
// =====================================

let db = JSON.parse(localStorage.getItem("slm_db"));

if(!db){

db = {
players:defaultPlayers,
matches:[],
tournaments:[],
cups:[]
};

saveDB();

}

// =====================================
// SAVE
// =====================================

function saveDB(){

localStorage.setItem(
"slm_db",
JSON.stringify(db)
);

}

// =====================================
// WIN RATE
// =====================================

function getWinRate(player){

if(player.matches === 0) return 0;

return Number(
((player.wins/player.matches)*100)
.toFixed(1)
);

}

// =====================================
// RANKINGS
// Win Rate -> MVP -> Matches
// =====================================

function updateRankings(){

db.players.sort((a,b)=>{

const wrA = getWinRate(a);
const wrB = getWinRate(b);

if(wrB !== wrA){
return wrB - wrA;
}

if(b.mvp !== a.mvp){
return b.mvp - a.mvp;
}

return b.matches - a.matches;

});

db.players.forEach((player,index)=>{

player.currentRank = index + 1;

if(
player.highestRank === 0 ||
player.currentRank < player.highestRank
){
player.highestRank = player.currentRank;
}

});

saveDB();

}

// =====================================
// ACHIEVEMENTS
// =====================================

function unlockAchievement(player,name){

if(!player.achievements.includes(name)){

player.achievements.push(name);

}

}

function checkAchievements(player){

if(player.tournamentsWon >= 1)
unlockAchievement(player,"🏆 First Tournament Win");

if(player.tournamentsWon >= 5)
unlockAchievement(player,"🏆 5 Tournament Wins");

if(player.tournamentsWon >= 10)
unlockAchievement(player,"🏆 10 Tournament Wins");

if(player.tournamentsWon >= 25)
unlockAchievement(player,"👑 Tournament King");

if(player.cupsWon >= 1)
unlockAchievement(player,"🥇 First Cup");

if(player.cupsWon >= 10)
unlockAchievement(player,"🏅 10 Cups");

if(player.cupsWon >= 25)
unlockAchievement(player,"🌟 Cup Legend");

if(player.mvp >= 1)
unlockAchievement(player,"⭐ First MVP");

if(player.mvp >= 25)
unlockAchievement(player,"⭐ 25 MVPs");

if(player.mvp >= 50)
unlockAchievement(player,"⭐ 50 MVPs");

if(player.mvp >= 100)
unlockAchievement(player,"⚡ MVP God");

}

// =====================================
// POINT SYSTEM
// =====================================

const POINTS = {
1:18,
2:15,
3:13,
4:12,
5:11
};

// =====================================
// SAVE MATCH
// rankingIds = [1,2,3,4,5]
// =====================================

function saveMatch(rankingIds){

rankingIds.forEach(id=>{

const player =
db.players.find(p=>p.id===id);

player.matches++;

});

const winner =
db.players.find(
p=>p.id===rankingIds[0]
);

winner.wins++;
winner.mvp++;
winner.currentStreak++;

if(
winner.currentStreak >
winner.longestStreak
){
winner.longestStreak =
winner.currentStreak;
}

rankingIds.slice(1).forEach(id=>{

const player =
db.players.find(p=>p.id===id);

player.losses++;
player.currentStreak = 0;

});

rankingIds.forEach((id,index)=>{

const player =
db.players.find(p=>p.id===id);

const position = index + 1;

player.points +=
POINTS[position] || 0;

checkAchievements(player);

});

db.matches.push({

id:Date.now(),

date:new Date().toLocaleString(),

rankings:rankingIds

});

updateRankings();

saveDB();

renderAll();

}

// =====================================
// HALL OF FAME
// =====================================

function getHallOfFame(){

const hall =
[...db.players]
.sort((a,b)=>
b.tournamentsWon -
a.tournamentsWon
)[0];

const legendary =
[...db.players]
.sort((a,b)=>
b.cupsWon -
a.cupsWon
)[0];

const mythic =
[...db.players]
.sort((a,b)=>
b.mvp -
a.mvp
)[0];

return {
hall,
legendary,
mythic
};

}

// =====================================
// PLAYERS
// =====================================

function renderPlayers(){

const grid =
document.getElementById(
"playerGrid"
);

if(!grid) return;

grid.innerHTML = "";

db.players.forEach(player=>{

grid.innerHTML += `

<div class="player-card">

<div class="player-info">

<h3>${player.name}</h3>

<p>@${player.username}</p>

<p>Rank #${player.currentRank}</p>

<p>WR: ${getWinRate(player)}%</p>

<p>MVP: ${player.mvp}</p>

</div>

</div>

`;

});

}

// =====================================
// LEADERBOARD
// =====================================

function renderLeaderboard(){

const table =
document.getElementById(
"leaderboardTable"
);

if(!table) return;

table.innerHTML = "";

db.players.forEach(player=>{

table.innerHTML += `

<tr>

<td>#${player.currentRank}</td>

<td>${player.name}</td>

<td>${getWinRate(player)}%</td>

<td>${player.mvp}</td>

</tr>

`;

});

}

// =====================================
// DASHBOARD
// =====================================

function renderDashboard(){

const tp =
document.getElementById(
"totalPlayers"
);

if(tp)
tp.textContent =
db.players.length;

const tm =
document.getElementById(
"totalMatches"
);

if(tm)
tm.textContent =
db.matches.length;

}

// =====================================
// HALL OF FAME UI
// =====================================

function renderTitles(){

const titles =
getHallOfFame();

const hof =
document.getElementById(
"hallOfFameHolder"
);

if(hof)
hof.textContent =
titles.hall?.name || "-";

const legendary =
document.getElementById(
"legendaryHolder"
);

if(legendary)
legendary.textContent =
titles.legendary?.name || "-";

const mythic =
document.getElementById(
"mythicHolder"
);

if(mythic)
mythic.textContent =
titles.mythic?.name || "-";

}

// =====================================
// RENDER ALL
// =====================================

function renderAll(){

renderPlayers();
renderLeaderboard();
renderDashboard();
renderTitles();

}

// =====================================
// PAGE NAVIGATION
// =====================================

document
.querySelectorAll(
".sidebar button"
)
.forEach(btn=>{

btn.addEventListener(
"click",
()=>{

document
.querySelectorAll(".page")
.forEach(page=>{

page.classList.remove(
"active"
);

});

document
.getElementById(
btn.dataset.page
)
.classList.add(
"active"
);

}
);

});

// =====================================
// START
// =====================================

updateRankings();
renderAll();
