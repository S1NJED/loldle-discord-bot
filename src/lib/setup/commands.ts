import * as path from "path";
import * as fs from "fs";
import { Client, Collection, Interaction } from "discord.js";


interface Client1 extends Client {
    commands: Collection<string, { execute: (interaction: Interaction) => Promise<void> }>
}

export async function loadCommands(client: Client1, __dirname: string)
{
    const foldersPath = path.join(__dirname, "commands");
    const commandsFolders = fs.readdirSync(foldersPath);

    for (const folder of commandsFolders)
    {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js") || file.endsWith(".ts") );
    
        for (const file of commandFiles)
        {
            const filePath = path.join(commandsPath, file);
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
}