import {
    Client,
    GatewayIntentBits,
    Collection,
    Interaction
} from "discord.js"

import { config } from "dotenv";config();
import { readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const __dirname = dirname(fileURLToPath(import.meta.url) );

interface Client1 extends Client {
    commands: Collection<string, { execute: (interaction: Interaction) => Promise<void> }>
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds 
    ]
}) as Client1;



// LOADING COMMANDS

client.commands = new Collection();

const foldersPath = join(__dirname, "commands");
const commandsFolders = readdirSync(foldersPath);

for (const folder of commandsFolders)
{
    const commandsPath = join(foldersPath, folder);
    const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith(".ts") );

    for (const file of commandFiles)
    {
        const filePath = join(commandsPath, file);
        const command = await import(filePath);
        
        if ("data" in command && "execute" in command)
        {
            console.log( `Sucessfully loaded ${file} command` );
            client.commands.set(command.data.name, command);
        }
        else
        {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

console.log('\n');
// Loading events
const eventsFolderPath = join(__dirname, "events");
const eventsFiles = readdirSync(eventsFolderPath).filter(file => file.endsWith(".ts"));

for (const file of eventsFiles)
{
    const filePath = join(eventsFolderPath, file);
    const event = await import(filePath);
    if (event.once)
    {
        client.once(event.name, (...args) => event.execute(...args));
    }
    else
    {
        client.on(event.name, (...args) => event.execute(...args));
    }
    console.log( `Sucessfully loaded ${event.name} event ` );
}


client.login(DISCORD_BOT_TOKEN);
