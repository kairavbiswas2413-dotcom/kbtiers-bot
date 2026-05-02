const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder, REST, Routes } = require("discord.js");

const TOKEN = process.env.TOKEN;

// ✅ YOUR IDs (already filled)
const CLIENT_ID = "1500092849176318023";
const GUILD_ID = "1499091184021409902";

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const commands = [
  new SlashCommandBuilder()
    .setName("profile")
    .setDescription("Check player profile")
    .addStringOption(option =>
      option.setName("player")
        .setDescription("Player name")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("tier")
    .setDescription("Add tier result")
    .addSubcommand(sub =>
      sub.setName("add")
        .addStringOption(o => o.setName("player").setRequired(true))
        .addStringOption(o => o.setName("region").setRequired(true))
        .addStringOption(o => o.setName("gamemode").setRequired(true))
        .addStringOption(o => o.setName("tier").setRequired(true))
        .addStringOption(o => o.setName("tester").setRequired(true))
    )
];

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: commands }
  );
  console.log("Commands registered ✅");
})();

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "tier") {
    const player = interaction.options.getString("player");
    const region = interaction.options.getString("region");
    const gamemode = interaction.options.getString("gamemode");
    const tier = interaction.options.getString("tier");
    const tester = interaction.options.getString("tester");

    const embed = new EmbedBuilder()
      .setTitle(`${player} Tier Results 🏆`)
      .setColor("#FFD700")
      .addFields(
        { name: "**Username**", value: player },
        { name: "**Region**", value: region },
        { name: "**Gamemode**", value: gamemode },
        { name: "**Tester**", value: tester },
        { name: "**Tier Earned**", value: tier }
      );

    await interaction.reply({ embeds: [embed] });
  }

  if (interaction.commandName === "profile") {
    const player = interaction.options.getString("player");

    const embed = new EmbedBuilder()
      .setTitle(`${player} Profile 📊`)
      .setDescription("Profile system coming soon...")
      .setColor("Blue");

    await interaction.reply({ embeds: [embed] });
  }
});

client.once("ready", () => {
  console.log("Bot Ready 🚀");
});

client.login(TOKEN);
