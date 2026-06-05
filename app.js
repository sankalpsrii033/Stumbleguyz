// ===============================
// STUMBLE LEAGUE MANAGER PRO
// app.js
// ===============================

// ---------- LOGIN ----------

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "stumble123";

const loginForm = document.getElementById("loginForm");
const loginScreen = document.getElementById("loginScreen");
const appContainer = document.getElementById("appContainer");
const loginError = document.getElementById("loginError");

if(localStorage.getItem("slm_logged_in") === "true"){
    showApp();
}

loginForm?.addEventListener("submit",(e)=>{
    e.preventDefault();

    const username =
    document.getElementById("adminUsername").value;

    const password =
    document.getElementById("adminPassword").value;

    if(
        username === ADMIN_USERNAME &&
        password === ADMIN_PASSWORD
    ){
        localStorage.setItem(
            "slm_logged_in",
            "true"
        );

        showApp();

    }else{
        loginError.textContent =
        "Invalid Admin Credentials";
    }
});

function showApp(){

    loginScreen.classList.add("hidden");
    appContainer.classList.remove("hidden");

    renderPlayers();
    renderRankings();
    updateDashboard();
}

// ---------- LOGOUT ----------

document
.getElementById("logoutBtn")
?.addEventListener("click",()=>{

    localStorage.removeItem(
        "slm_logged_in"
    );

    location.reload();
});

// ---------- PAGE NAVIGATION ----------

const navButtons =
document.querySelectorAll(".nav-btn");

const pages =
document.querySelectorAll(".page");

navButtons.forEach(btn=>{

    btn.addEventListener("click",()=>{

        navButtons.forEach(b=>
            b.classList.remove("active")
        );

        pages.forEach(page=>
            page.classList.remove("active-page")
        );

        btn.classList.add("active");

        const pageId =
        btn.dataset.page;

        document
        .getElementById(pageId)
        .classList.add("active-page");
    });

});

// ---------- PLAYERS ----------

function renderPlayers(){

    const grid =
    document.getElementById("playersGrid");

    if(!grid) return;

    grid.innerHTML = "";

    players.forEach(player=>{

        const card =
        document.createElement("div");

        card.className =
        "glass-card player-card";

        card.innerHTML = `

            <div class="player-name">
                ${player.name}
            </div>

            <div class="player-username">
                @${player.username}
            </div>

            <div class="player-stats">

                <div class="player-stat">
                    <strong>${player.matches}</strong>
                    <br>
                    Matches
                </div>

                <div class="player-stat">
                    <strong>${player.wins}</strong>
                    <br>
                    Wins
                </div>

                <div class="player-stat">
                    <strong>${player.mvp}</strong>
                    <br>
                    MVP
                </div>

                <div class="player-stat">
                    <strong>
                    ${getWinRate(player)}%
                    </strong>
                    <br>
                    Win Rate
                </div>

            </div>

        `;

        grid.appendChild(card);

    });

}

// ---------- ADD PLAYER ----------

document
.getElementById("addPlayerForm")
?.addEventListener("submit",(e)=>{

    e.preventDefault();

    const name =
    document
    .getElementById("playerName")
    .value;

    const username =
    document
    .getElementById("playerUsername")
    .value;

    const newPlayer = {

        id: Date.now(),

        name,
        username,

        matches:0,
        wins:0,
        losses:0,
        mvp:0,
        points:0,

        tournamentsWon:0,
        cupsWon:0,

        joinDate:
        new Date().toISOString(),

        highestRank:999
    };

    players.push(newPlayer);

    savePlayers();

    renderPlayers();
    renderRankings();
    updateDashboard();

    e.target.reset();

});

// ---------- WIN RATE ----------

function getWinRate(player){

    if(player.matches === 0){
        return 0;
    }

    return (
        (player.wins/player.matches)*100
    ).toFixed(1);
}

// ---------- RANKINGS ----------

function renderRankings(){

    const body =
    document.getElementById(
        "rankingBody"
    );

    if(!body) return;

    body.innerHTML = "";

    const rankedPlayers =
    [...players].sort((a,b)=>{

        const wrA =
        Number(getWinRate(a));

        const wrB =
        Number(getWinRate(b));

        if(wrB !== wrA){
            return wrB - wrA;
        }

        if(b.mvp !== a.mvp){
            return b.mvp - a.mvp;
        }

        if(b.matches !== a.matches){
            return b.matches - a.matches;
        }

        return new Date(a.joinDate)
        - new Date(b.joinDate);

    });

    rankedPlayers.forEach(
    (player,index)=>{

        const row =
        document.createElement("tr");

        row.innerHTML = `
            <td>#${index+1}</td>
            <td>${player.name}</td>
            <td>${getWinRate(player)}%</td>
            <td>${player.mvp}</td>
            <td>${player.matches}</td>
        `;

        body.appendChild(row);

    });

}

// ---------- DASHBOARD ----------

function updateDashboard(){

    document.getElementById(
        "totalPlayers"
    ).textContent =
    players.length;

    let totalMatches = 0;
    let totalMvps = 0;

    players.forEach(player=>{

        totalMatches +=
        player.matches;

        totalMvps +=
        player.mvp;
    });

    document.getElementById(
        "totalMatches"
    ).textContent =
    totalMatches;

    document.getElementById(
        "totalMvps"
    ).textContent =
    totalMvps;

    const rankedPlayers =
    [...players].sort((a,b)=>{

        const wrA =
        Number(getWinRate(a));

        const wrB =
        Number(getWinRate(b));

        if(wrB !== wrA){
            return wrB - wrA;
        }

        return b.mvp - a.mvp;

    });

    if(rankedPlayers.length){

        document.getElementById(
            "topPlayer"
        ).textContent =
        rankedPlayers[0].name;
    }

    updateTitles();
}

// ---------- TITLES ----------

function updateTitles(){

    const hallOfFame =
    [...players].sort(
    (a,b)=>
    b.tournamentsWon -
    a.tournamentsWon
    )[0];

    const legendary =
    [...players].sort(
    (a,b)=>
    b.cupsWon -
    a.cupsWon
    )[0];

    const mythic =
    [...players].sort(
    (a,b)=>
    b.mvp -
    a.mvp
    )[0];

    document.getElementById(
        "hallOfFameHolder"
    ).textContent =
    hallOfFame?.name || "-";

    document.getElementById(
        "legendaryHolder"
    ).textContent =
    legendary?.name || "-";

    document.getElementById(
        "mythicHolder"
    ).textContent =
    mythic?.name || "-";
}
