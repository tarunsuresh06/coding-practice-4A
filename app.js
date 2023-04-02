const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server Started on Port 3000");
    });
  } catch (err) {
    console.log(`DB Error: ${err.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT
    *
    FROM
    cricket_team;`;
  const playersArray = await db.all(getPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

app.post("/players/", async (req, res) => {
  const playerDetails = req.body;

  console.log(playerDetails);

  const { playerName, jerseyNumber, role } = playerDetails;

  const addPlayersQuery = `
    INSERT INTO cricket_team(
        player_name, jersey_number, role
    ) values (
        ${playerName},
        ${jerseyNumber},
        ${role}
    );
    `;

  const dbResponse = await db.run(addPlayersQuery);
  const player_id = dbResponse.lastID;
  res.send({ player_id: player_id });
});

app.get("/players/:playerId/", async (req, res) => {
  const { playerId } = req.params;

  console.log(playerId);

  const getPlayerQuery = `
    SELECT *
    FROM cricket_team
    WHERE player_id = ${playerId};
    `;

  const players = await db.get(getPlayerQuery);
  res.send(convertDbObjectToResponseObject(players));
});

app.put("/players/:playerId/", async (req, res) => {
  const { playerId } = req.params;
  const playerDetails = req.body;
  const { playerName, jerseyNumber, role } = playerDetails;

  const updatePlayerQuery = `
    UPDATE cricket_team
    SET 
    player_name = ${playerName},
    jersey_number = ${jerseyNumber},
    role = ${role}
    WHERE player_id = ${playerId};
    `;

  await db.run(updatePlayerQuery);
  res.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (req, res) => {
  const { playerId } = req.params;

  const deletePlayerQuery = `
    DELETE FROM cricket_team
    WHERE player_id = ${playerId};
    `;

  const players = await db.run(deletePlayerQuery);
  res.send("Player Removed");
});

module.exports = app;
