# Discord Bot - KickAll and DMAll

This Discord bot is designed to manage a server by providing the ability to kick all members and send mass DMs to all members with a customizable message.

## Features

### 1. **Kick All Members Command (`!kickall`)**
- Kicks all members and bots from the guild, except for those with specific roles defined in the `ignoreRoleIds` field.
- Only the user with the ID specified in the `allowedUserId` field can execute this command.
- Logs the success/failure of each kicked member to a specified global log channel.

### 2. **DM All Members Command (`!dmall`)**
- Sends a custom DM message (with an embedded message) to all members of the server, excluding bots.
- The user can append a custom message to the `!dmall` command.
- Logs the success/failure of each DM sent in the global log channel.

### 3. **Leave Guild Command (`!leaveguild`)**
- The bot can leave a specific guild based on the `guildId`.
- This command is restricted to the `allowedUserId`.

### 4. **Global Error Handling**
- Logs any unhandled rejections and errors in the `globalLogChannelId` with detailed information about the error.

---

## Configuration

Make sure to update the `config.json` file with your own bot's settings:

```json
{
  "token": "YOUR_BOT_TOKEN",
  "guildId": "YOUR_GUILD_ID",
  "allowedUserId": "USER_ID_WITH_PERMISSION_TO_USE_COMMANDS",
  "commandPrefix": "!", 
  "ignoreRoleIds": ["ROLE_ID_TO_IGNORE_1", "ROLE_ID_TO_IGNORE_2"],
  "logChannelId": "YOUR_LOG_CHANNEL_ID",
  "globalLogChannelId": "YOUR_GLOBAL_LOG_CHANNEL_ID"
}
```
## Installation

```bash
git clone https://github.com/yourusername/discord-bot-kickall-dmall.git
cd discord-bot-kickall-dmall
```
To Run the Bot use command **node bot.js**

## Credits To

This bot was developed by Ubaidullah and supported by Maxify Studio.

- **[Ubaidullah](https://discord.gg/neverlands)** for providing the inspiration and the original code.
- Created & Supervised Under **[Maxify](https://discord.gg/maxify)**