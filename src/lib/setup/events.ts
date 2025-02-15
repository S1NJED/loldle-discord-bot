import * as path from "path";
import * as fs from "fs";
import { Client } from "discord.js";



export async function loadEvents(client: Client, __dirname: string)
{
    const eventsFolderPath = path.join(__dirname, "events");
    const eventsFiles = fs.readdirSync(eventsFolderPath).filter(file => file.endsWith(".ts"));
    
    for (const file of eventsFiles)
    {
        const filePath = path.join(eventsFolderPath, file);
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
}