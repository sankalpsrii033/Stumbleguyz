// ===============================
// STUMBLE LEAGUE MANAGER PRO
// data.js
// ===============================

// ---------- DEFAULT PLAYERS ----------

const defaultPlayers = [

    {
        id: 1,
        name: "Sankalp",
        username: "sankalp_op",

        matches: 0,
        wins: 0,
        losses: 0,

        mvp: 0,
        points: 0,

        tournamentsWon: 0,
        cupsWon: 0,

        highestRank: 999,

        joinDate: "2026-06-05"
    },

    {
        id: 2,
        name: "Akshat Rakesh",
        username: "terrorbebu",

        matches: 0,
        wins: 0,
        losses: 0,

        mvp: 0,
        points: 0,

        tournamentsWon: 0,
        cupsWon: 0,

        highestRank: 999,

        joinDate: "2026-06-05"
    },

    {
        id: 3,
        name: "Atharva Mishra",
        username: "panditdabang",

        matches: 0,
        wins: 0,
        losses: 0,

        mvp: 0,
        points: 0,

        tournamentsWon: 0,
        cupsWon: 0,

        highestRank: 999,

        joinDate: "2026-06-05"
    },

    {
        id: 4,
        name: "Nayan Mehrotra",
        username: "nbot",

        matches: 0,
        wins: 0,
        losses: 0,

        mvp: 0,
        points: 0,

        tournamentsWon: 0,
        cupsWon: 0,

        highestRank: 999,

        joinDate: "2026-06-05"
    },

    {
        id: 5,
        name: "Yugank Dwivedi",
        username: "yuggu",

        matches: 0,
        wins: 0,
        losses: 0,

        mvp: 0,
        points: 0,

        tournamentsWon: 0,
        cupsWon: 0,

        highestRank: 999,

        joinDate: "2026-06-05"
    }

];

// ---------- LOAD PLAYERS ----------

let players =
JSON.parse(
    localStorage.getItem("slm_players")
) || defaultPlayers;

// ---------- SAVE PLAYERS ----------

function savePlayers(){

    localStorage.setItem(
        "slm_players",
        JSON.stringify(players)
    );

}

// ---------- HISTORY ----------

let history =
JSON.parse(
    localStorage.getItem("slm_history")
) || [];

function saveHistory(){

    localStorage.setItem(
        "slm_history",
        JSON.stringify(history)
    );

}

// ---------- SETTINGS ----------

const settings = {

    appName:
    "Stumble League Manager",

    version:
    "1.0.0",

    rankingSystem:
    "Win Rate > MVP > Matches"

};

// ---------- FIRST RUN ----------

if(
    !localStorage.getItem(
        "slm_players"
    )
){

    localStorage.setItem(
        "slm_players",
        JSON.stringify(defaultPlayers)
    );

}
