import * as dotenv from "dotenv";
dotenv.config();

const { DISCORD_BOT_TOKEN, CLIENT_ID, GUILD_ID } = process.env;

if (!DISCORD_BOT_TOKEN || !CLIENT_ID || !GUILD_ID)
{
    throw new Error("Missing env vars");
}

export const config = {
    DISCORD_BOT_TOKEN,
    CLIENT_ID,
    GUILD_ID
}
