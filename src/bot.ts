import {
    Client,
    GatewayIntentBits,
    Collection,
    Interaction
} from "discord.js"

import { config } from "dotenv";config();
import { loadCommands } from "./lib/setup/commands";
import { loadEvents } from "./lib/setup/events";
import { startTask } from "./lib/setup/task";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __dirname = dirname(fileURLToPath(import.meta.url) );

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

interface Client1 extends Client {
    commands: Collection<string, { execute: (interaction: Interaction) => Promise<void> }>
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages, // for onMessageCreate
        GatewayIntentBits.MessageContent // for onMessageCreate 
    ]
}) as Client1;

client.commands = new Collection();

await loadCommands(client, __dirname);
console.log('\n');
await loadEvents(client, __dirname);

startTask(client);


client.login(DISCORD_BOT_TOKEN);
