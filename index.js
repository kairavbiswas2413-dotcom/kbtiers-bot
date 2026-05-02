const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder, REST, Routes } = require("discord.js");

const TOKEN = process.env.TOKEN;

const CLIENT_ID = "1500092849176318023";
const GUILD_ID = "1499091184021409902";

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// 🧠 MEMORY STORAGE
let playerData = {};

// 🎮 GAMEMODES
const gamemodes = ["Vanilla", "UHC", "Diapot", "Nethpot", "SMP", "Sword", "Axe", "Mace"];

// 📌 COMMANDS
const commands = [
  new SlashCommandBuilder()
    .setName("profile")
    .setDescription("Check player profile")
    .addStringOption(option =>
      option.setName("player").setDescription("Player name").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("tier")
    .setDescription("Add tier")
    .addSubcommand(sub =>
      sub.setName("add")
        .setDescription("Add tier result")
        .addStringOption(o => o.setName("player").setDescription("Player").setRequired(true))
        .addStringOption(o => o.setName("region").setDescription("Region").setRequired(true))
        .addStringOption(o => o.setName("gamemode").setDescription("Gamemode").setRequired(true))
        .addStringOption(o => o.setName("tier").setDescription("Tier").setRequired(true))
        .addStringOption(o => o.setName("tester").setDescription("Tester").setRequired(true))
    ),

  new SlashCommandBuilder()
    .setName("top")
    .setDescription("Leaderboard")
];

// 📌 REGISTER COMMANDS
const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: commands }
  );
  console.log("Commands registered ✅");
})();

// 🎯 BOT EVENTS
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  // 🟢 ADD TIER
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

    const embed = new EmbedBuilder()
      .setTitle(`🏆 ${player} Tier Results`)
      .setColor("#00FFAA")
      .setDescription(
        `━━━━━━━━━━━━━━\n` +
        `👤 **Username:** ${player}\n` +
        `🌍 **Region:** ${region}\n` +
        `⚔️ **Gamemode:** ${gamemode}\n` +
        `🧪 **Tester:** ${tester}\n` +
        `🏅 **Tier:** ${tier}\n` +
        `━━━━━━━━━━━━━━`
      )
      .setFooter({ text: "KBTiers System" });

    await interaction.reply({ embeds: [embed] });
  }

  // 🔵 PROFILE
  if (interaction.commandName === "profile") {
    const player = interaction.options.getString("player");

    let desc = "━━━━━━━━━━━━━━\n";

    for (let mode of gamemodes) {
      let t = playerData[player]?.tiers[mode] || "—";
      desc += `⚔️ **${mode}:** ${t}\n`;
    }

    desc += "━━━━━━━━━━━━━━";

    const embed = new EmbedBuilder()
      .setTitle(`📊 ${player} Profile`)
      .setColor("#0099FF")
      .setDescription(desc)
      .setFooter({ text: "KBTiers Profile System" });

    await interaction.reply({ embeds: [embed] });
  }

  // 🟡 LEADERBOARD
  if (interaction.commandName === "top") {
    let players = Object.keys(playerData);

    if (players.length === 0) {
      return interaction.reply("No data yet!");
    }

    let desc = "🏆 Leaderboard\n━━━━━━━━━━━━━━\n";

    players.slice(0, 10).forEach((p, i) => {
      desc += `#${i + 1} 👤 ${p}\n`;
    });

    desc += "━━━━━━━━━━━━━━";

    const embed = new EmbedBuilder()
      .setTitle("Top Players")
      .setColor("#FFD700")
      .setDescription(desc);

    await interaction.reply({ embeds: [embed] });
  }
});

client.once("ready", () => {
  console.log("Bot Ready 🚀");
});

client.login(TOKEN);
