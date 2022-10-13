
const { Options } =  require("discord.js");

const Discord = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes, ApplicationCommandOptionType } = require("discord.js");

const config = {
  token : 'MTAyNzc2NTA5Mjc3Mjc0MTEyMA.GNRv1D.XOx1j0B1qA81X_xuqSmunhiau9taB-Gno845Ck',
  guild_id : '757788195361521794',
  client_id : '1027765092772741120'
}

const client = new Discord.Client({
  intents: [
      "Guilds",
      "GuildVoiceStates"
  ]
});
const { Player } = require("discord-player");

// Create a new Player (you don't need any API Key)
const player = new Player(client);

// add the trackStart event so when a song will be played this message will be sent
player.on("trackStart", (queue, track) => queue.metadata.channel.send(`🎶 | Now playing **${track.title}**!`))

client.once("ready", () => {
  console.log("I'm ready !");
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // /play track:Despacito
  // will play "Despacito" in the voice channel
  if (interaction.commandName === "play") {
      if (!interaction.member.voice.channelId) return await interaction.reply({ content: "You are not in a voice channel!", ephemeral: true });
      if (interaction.guild.members.me.voice.channelId && interaction.member.voice.channelId !== interaction.guild.members.me.voice.channelId) return await interaction.reply({ content: "You are not in my voice channel!", ephemeral: true });
      const query = interaction.options.getString("query");
      const queue = player.createQueue(interaction.guild, {
          metadata: {
              channel: interaction.channel
          }
      });

     
      
      // verify vc connection
      try {
          if (!queue.connection) await queue.connect(interaction.member.voice.channel);
      } catch {
          queue.destroy();
          return await interaction.reply({ content: "Could not join your voice channel!", ephemeral: true });
      }

      await interaction.deferReply();
      const track = await player.search(query, {
          requestedBy: interaction.user
      }).then(x => x.tracks[0]);
      if (!track) return await interaction.followUp({ content: `❌ | Track **${query}** not found!` });

      queue.play(track);

      return await interaction.followUp({ content: `⏱️ | Loading track **${track.title}**!` });
  }
  if(interaction.commandName === "stop"){
    try {
      if (!queue.connection) await queue.connect(interaction.member.voice.channel);
  } catch {
      queue.destroy();
      return await interaction.reply({ content: "Could not join your voice channel!", ephemeral: true });
  }
    return interaction.followUp({content: `meu pau`})
  }
});

const commands = [
  {
    name: "play",
    description: "Plays a song!",
    options: [
        {
            name: "query",
            type: ApplicationCommandOptionType.String,
            description: "The song you want to play",
            required: true
        }
    ]
  },
  {
    name: "stop",
    description: "Stop a song"
  }
];

const rest = new REST({ version: "10" }).setToken(config.token);

(async () => {
  try {
    console.log("Started refreshing application [/] commands.");

    await rest.put(Routes.applicationGuildCommands(config.client_id, config.guild_id), { body: commands });

    console.log("Successfully reloaded application [/] commands.");
  } catch(error) {
    console.error(error);
  }
})();


client.login(config.token);