const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  SlashCommandBuilder,
  REST,
  Routes
} = require("discord.js");

const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();

app.use(cors());

const TOKEN = process.env.TOKEN;

// ✅ FIXED CLIENT ID
const CLIENT_ID = "1501851418817069126";

// ✅ YOUR SERVER ID
const GUILD_ID = "1499091184021409902";

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// 🧠 LOAD DATA
let playerData = {};

if (fs.existsSync("data.json")) {
  playerData = JSON.parse(
    fs.readFileSync("data.json", "utf8")
  );
}

// 🎮 GAMEMODES
const gamemodes = [
  "Vanilla",
  "UHC",
  "Diapot",
  "Nethpot",
  "SMP",
  "Sword",
  "Axe",
  "Mace"
];

// 🌐 API
app.get("/", (req, res) => {
  res.send("KB Tiers Bot API Running 🚀");
});

app.get("/players", (req, res) => {
  res.json(playerData);
});

// 🚀 START SERVER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});

// 📌 SLASH COMMANDS
const commands = [
  new SlashCommandBuilder()
    .setName("profile")
    .setDescription("Check player profile")
    .addStringOption(option =>
      option
        .setName("player")
        .setDescription("Player name")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("tier")
    .setDescription("Tier system")
    .addSubcommand(sub =>
      sub
        .setName("add")
        .setDescription("Add tier")
        .addStringOption(o =>
          o
            .setName("player")
            .setDescription("Player")
            .setRequired(true)
        )
        .addStringOption(o =>
          o
            .setName("region")
            .setDescription("Region")
            .setRequired(true)
        )
        .addStringOption(o =>
          o
            .setName("gamemode")
            .setDescription("Gamemode")
            .setRequired(true)
        )
        .addStringOption(o =>
          o
            .setName("tier")
            .setDescription("Tier")
            .setRequired(true)
        )
        .addStringOption(o =>
          o
            .setName("tester")
            .setDescription("Tester")
            .setRequired(true)
        )
    ),

  new SlashCommandBuilder()
    .setName("top")
    .setDescription("Leaderboard")
].map(cmd => cmd.toJSON());

// 📌 REGISTER COMMANDS
const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  try {
    console.log("Registering commands...");

    await rest.put(
      Routes.applicationGuildCommands(
        CLIENT_ID,
        GUILD_ID
      ),
      { body: commands }
    );

    console.log("Commands registered ✅");
  } catch (err) {
    console.error(err);
  }
})();

// 🎯 EVENTS
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  // 🟢 ADD TIER
  if (
    interaction.commandName === "tier" &&
    interaction.options.getSubcommand() === "add"
  ) {
    const player =
      interaction.options.getString("player");

    const region =
      interaction.options.getString("region");

    const gamemode =
      interaction.options.getString("gamemode");

    const tier =
      interaction.options.getString("tier");

    const tester =
      interaction.options.getString("tester");

    if (!playerData[player]) {
      playerData[player] = {
        region,
        tiers: {}
      };
    }

    playerData[player].region = region;
    playerData[player].tiers[gamemode] = tier;

    // 💾 SAVE
    fs.writeFileSync(
      "data.json",
      JSON.stringify(playerData, null, 2)
    );

    const embed = new EmbedBuilder()
      .setTitle(`${player} Tier Results 🏆`)
      .setColor("#FFD700")
      .addFields(
        {
          name: "Username",
          value: player,
          inline: true
        },
        {
          name: "Region",
          value: region,
          inline: true
        },
        {
          name: "Gamemode",
          value: gamemode,
          inline: true
        },
        {
          name: "Tier",
          value: tier,
          inline: true
        },
        {
          name: "Tester",
          value: tester,
          inline: true
        }
      );

    await interaction.reply({
      embeds: [embed]
    });
  }

  // 🔵 PROFILE
  if (interaction.commandName === "profile") {
    const player =
      interaction.options.getString("player");

    if (!playerData[player]) {
      return interaction.reply({
        content: "Player not found!",
        ephemeral: true
      });
    }

    let desc = "";

    for (const mode of gamemodes) {
      desc += `**${mode}:** ${
        playerData[player].tiers[mode] || "EMPTY"
      }\n`;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${player} Profile`)
      .setColor("Blue")
      .setDescription(desc);

    await interaction.reply({
      embeds: [embed]
    });
  }

  // 🟡 TOP
  if (interaction.commandName === "top") {
    const players = Object.keys(playerData);

    if (players.length === 0) {
      return interaction.reply("No data yet!");
    }

    let desc = "";

    players.slice(0, 10).forEach((p, i) => {
      desc += `#${i + 1} ${p}\n`;
    });

    const embed = new EmbedBuilder()
      .setTitle("Leaderboard 🏆")
      .setColor("#FFD700")
      .setDescription(desc);

    await interaction.reply({
      embeds: [embed]
    });
  }
});

// 🤖 READY
client.once("ready", () => {
  console.log(`${client.user.tag} is online 🚀`);
});

// LOGIN
client.login(TOKEN);
