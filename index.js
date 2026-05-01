const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

let players = {};

client.once("ready", () => {
  console.log("KBTiers Bot Online");
});

client.on("messageCreate", (msg) => {
  if (msg.author.bot) return;

  if (msg.content.startsWith("!add ")) {
    let name = msg.content.split(" ")[1];
    players[name] = {};
    msg.reply("Added: " + name);
  }

  if (msg.content.startsWith("!set ")) {
    let p = msg.content.split(" ");
    let name = p[1];
    let region = p[2];
    let mode = p[3];
    let tier = p[4];

    if (!players[name]) players[name] = { region };

    players[name].region = region;
    players[name][mode] = tier;

    msg.reply(`${name} updated → ${mode} ${tier} (${region})`);
  }

  if (msg.content.startsWith("!profile ")) {
    let name = msg.content.split(" ")[1];

    if (!players[name]) return msg.reply("Not found");

    let p = players[name];
    let text = `Profile: ${name}\nRegion: ${p.region}\n`;

    for (let g in p) {
      if (g !== "region") text += `${g}: ${p[g]}\n`;
    }

    msg.reply(text);
  }
});

client.login(process.env.TOKEN);
