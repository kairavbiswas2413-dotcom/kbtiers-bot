const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder, REST, Routes } = require("discord.js");

const TOKEN = process.env.TOKEN;

// 🔴 PASTE HERE
const CLIENT_ID = "PASTE_HERE";
const GUILD_ID = "PASTE_SERVER_ID";

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const commands = [
  new SlashCommandBuilder()
    .setName("profile")
    .setDescription("Check player profile")
    .addStringOption(option =>
      option.setName("player")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("tier")
    .setDescription("Add tier")
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
      .addFields(
        { name: "Username", value: player },
        { name: "Region", value: region },
        { name: "Gamemode", value: gamemode },
        { name: "Tester", value: tester },
        { name: "Tier Earned", value: tier }
      );

    await interaction.reply({ embeds: [embed] });
  }
});

client.login(TOKEN);
