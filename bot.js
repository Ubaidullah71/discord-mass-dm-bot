const { Client, GatewayIntentBits, PermissionsBitField, EmbedBuilder } = require('discord.js');
const config = require('./config.json');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers]
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// Global error handler
process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
  const globalLogChannel = client.channels.cache.get(config.globalLogChannelId);
  if (globalLogChannel) {
    const embed = new EmbedBuilder()
      .setTitle("Bot Encountered an Error")
      .setDescription(`An unexpected error occurred: ${error.message}`)
      .setColor(0xff0000)
      .setTimestamp();
    globalLogChannel.send({ embeds: [embed] });
  }
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Kick all members command
  if (message.content === `${config.commandPrefix}kickall` && message.author.id === config.allowedUserId) {
    const guild = client.guilds.cache.get(config.guildId);
    const globalLogChannel = client.channels.cache.get(config.globalLogChannelId);

    if (!guild) return message.reply("Specified guild not found.");

    const botMember = guild.members.cache.get(client.user.id);
    if (!botMember.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return message.reply("Bot lacks permissions to kick members in this guild.");
    }

    await message.reply("Starting to kick all users and bots...");

    try {
      const members = await guild.members.fetch();
      for (const [memberId, member] of members) {
        if (
          member.id === client.user.id ||
          botMember.roles.highest.position <= member.roles.highest.position ||
          config.ignoreRoleIds.some(roleId => member.roles.cache.has(roleId))
        ) {
          continue;
        }

        try {
          await member.kick("Kicked by bot command");
          console.log(`Kicked ${member.user.tag}`);
          if (globalLogChannel) {
            const embed = new EmbedBuilder()
              .setTitle("User Kicked")
              .setDescription(`Successfully kicked **${member.user.tag}**`)
              .addFields(
                { name: "User ID", value: member.id, inline: true },
                { name: "Guild", value: guild.name, inline: true }
              )
              .setColor(0x00ff00)
              .setTimestamp();
            globalLogChannel.send({ embeds: [embed] });
          }
        } catch (error) {
          console.error(`Failed to kick ${member.user.tag}: ${error.message}`);
          if (globalLogChannel) {
            const embed = new EmbedBuilder()
              .setTitle("Failed to Kick User")
              .setDescription(`Could not kick **${member.user.tag}**`)
              .addFields(
                { name: "User ID", value: member.id, inline: true },
                { name: "Error", value: error.message, inline: true }
              )
              .setColor(0xff0000)
              .setTimestamp();
            globalLogChannel.send({ embeds: [embed] });
          }
        }
      }
      await message.reply("Finished attempting to kick all possible users and bots.");
    } catch (error) {
      console.error("Error fetching or kicking members:", error);
      await message.reply("An error occurred while trying to kick members.");
    }
  }

  // DM all members command
  if (message.content.startsWith(`${config.commandPrefix}dmall`) && message.author.id === config.allowedUserId) {
    const guild = client.guilds.cache.get(config.guildId);
    const globalLogChannel = client.channels.cache.get(config.globalLogChannelId);

    if (!guild) return message.reply("Specified guild not found.");

    const botMember = guild.members.cache.get(client.user.id);
    if (!botMember.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply("Bot lacks permissions to DM members in this guild.");
    }

    const messageContent = message.content.slice((`${config.commandPrefix}dmall`).length).trim();
    if (!messageContent) return message.reply("Please provide a message to send.");

    const embed = new EmbedBuilder()
      .setTitle("Attention Please!")
      .setDescription("Our current server is closing soon. Please join our new server using the link below.")
      .setColor(0x7289da)
      .addFields({ name: "Transfer of Brand", value: "Our Magnum is Now Maxify, a better name & work!" })
      .setFooter({ text: "maxify help & support | msg by kazuma" });

    await message.reply("Starting to send DMs to all members...");

    try {
      const members = await guild.members.fetch();
      for (const [memberId, member] of members) {
        if (member.user.bot || member.id === client.user.id) continue;

        try {
          const embedMessage = await member.send({ embeds: [embed] });
          console.log(`Sent embed DM to ${member.user.tag}`);

          await member.send({
            content: messageContent,
            reply: { messageReference: embedMessage.id }
          });
          console.log(`Sent custom message DM as a reply to ${member.user.tag}`);

          if (globalLogChannel) {
            const embedLog = new EmbedBuilder()
              .setTitle("DM Sent")
              .setDescription(`Successfully sent DM to **${member.user.tag}**`)
              .addFields(
                { name: "User ID", value: member.id, inline: true },
                { name: "Guild", value: guild.name, inline: true }
              )
              .setColor(0x00ff00)
              .setTimestamp();
            globalLogChannel.send({ embeds: [embedLog] });
          }
        } catch (error) {
          if (error.code === 50007) {
            console.log(`Cannot send DM to ${member.user.tag} (DMs disabled or blocked).`);
          } else {
            console.error(`Failed to send DM to ${member.user.tag}: ${error.message}`);
          }

          if (globalLogChannel) {
            const embedLog = new EmbedBuilder()
              .setTitle("Failed to Send DM")
              .setDescription(`Could not send DM to **${member.user.tag}**`)
              .addFields(
                { name: "User ID", value: member.id, inline: true },
                { name: "Error", value: error.code === 50007 ? "DMs disabled or blocked" : error.message, inline: true }
              )
              .setColor(0xff0000)
              .setTimestamp();
            globalLogChannel.send({ embeds: [embedLog] });
          }
        }
      }
      await message.reply("Finished sending DMs to all possible members.");
    } catch (error) {
      console.error("Error fetching or sending DMs to members:", error);
      await message.reply("An error occurred while trying to send DMs.");
    }
  }

  // Leave guild command
  if (message.content.startsWith(`${config.commandPrefix}leaveguild`) && message.author.id === config.allowedUserId) {
    const [_, guildId] = message.content.split(" ");
    const guild = client.guilds.cache.get(guildId);

    if (guild) {
      await message.reply(`Leaving guild: ${guild.name}`);
      await guild.leave();
    } else {
      await message.reply("Guild not found or the bot is not a member of that guild.");
    }
  }
});

client.login(config.token);