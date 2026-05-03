const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder, REST, Routes } = require("discord.js");
const express = require("express");
const fs = require("fs");

const app = express();

const TOKEN = process.env.TOKEN;

const CLIENT_ID = "1500092849176318023";
const GUILD_ID = "1499091184021409902";

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// 🧠 LOAD DATA (PERMANENT)
let playerData = {};
if (fs.existsSync("data.json")) {
  playerData = JSON.parse(fs.readFileSync("data.json"));
}

// 🎮 GAMEMODES
const gamemodes = ["Vanilla", "UHC", "Diapot", "Nethpot", "SMP", "Sword", "Axe", "Mace"];

// 🌐 WEBSITE API
app.get("/players", (req, res) => {
  res.json(playerData);
});

// 🚀 START API
app.listen(3000, () => {
  console.log("API running 🚀");
});

// 📌 COMMANDS (UNCHANGED)
const commands = [
  new SlashCommandBuilder()
    .setName("profile")
    .setDescription("Check player profile")
    .addStringOption(option =>
      option.setName("player")
        .setDescription("Enter player name")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("tier")
    .setDescription("Add tier result")
    .addSubcommand(sub =>
      sub.setName("add")
        .setDescription("Add a tier result")
        .addStringOption(o => o.setName("player").setDescription("Player Name").setRequired(true))
        .addStringOption(o => o.setName("region").setDescription("Region").setRequired(true))
        .addStringOption(o => o.setName("gamemode").setDescription("Gamemode").setRequired(true))
        .addStringOption(o => o.setName("tier").setDescription("Tier Earned").setRequired(true))
        .addStringOption(o => o.setName("tester").setDescription("Tester Name").setRequired(true))
    ),

  new SlashCommandBuilder()
    .setName("top")
    .setDescription("Leaderboard")
];

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: commands }
  );
  console.log("Commands registered ✅");
})();

// 🎯 EVENTS
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  // 🟢 TIER ADD (UNCHANGED EMBED)
  if (interaction.commandName === "tier") {
    const player = interaction.options.getString("player");
    const region = interaction.options.getString("region");
    const gamemode = interaction.options.getString("gamemode");
    const tier = interaction.options.getString("tier");
    const tester = interaction.options.getString("tester");

    if (!playerData[player]) {
      playerData[player] = { region: region, tiers: {} };
    }

    playerData[player].tiers[gamemode] = tier;

    // 💾 SAVE FILE
    fs.writeFileSync("data.json", JSON.stringify(playerData, null, 2));

    const embed = new EmbedBuilder()
      .setTitle(`${player} Tier Results 🏆`)
      .setColor("#FFD700")
      .addFields(
        { name: "Username", value: player },
        { name: "Region", value: region },
        { name: "Gamemode", value: gamemode },
        { name: "Tester", value: tester },
        { name: "Tier Earned", value: tier }
      );

    await interaction.reply({ embeds: [embed] });
  }

  // 🔵 PROFILE (UNCHANGED STYLE)
  if (interaction.commandName === "profile") {
    const player = interaction.options.getString("player");

    let desc = "";

    for (let mode of gamemodes) {
      let t = playerData[player]?.tiers[mode] || " ";
      desc += `${mode}: ${t}\n`;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${player} Profile`)
      .setColor("Blue")
      .setDescription(desc);

    await interaction.reply({ embeds: [embed] });
  }

  // 🟡 TOP
  if (interaction.commandName === "top") {
    let players = Object.keys(playerData);

    if (players.length === 0) {
      return interaction.reply("No data yet!");
    }

    let desc = "";

    players.slice(0, 10).forEach((p, i) => {
      desc += `#${i + 1} ${p}\n`;
    });

    const embed = new EmbedBuilder()
      .setTitle("Leaderboard")
      .setColor("#FFD700")
      .setDescription(desc);

    await interaction.reply({ embeds: [embed] });
  }
});

client.once("ready", () => {
  console.log("Bot Ready 🚀");
});

client.login(TOKEN);
