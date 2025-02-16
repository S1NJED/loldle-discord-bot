import { Events, Client, ActivityType } from "discord.js";

export const name = Events.ClientReady;
export const once = true;

export async function execute(client: Client)
{
    console.log(` Bot is ready logged in as ${client.user!.tag} `);
    client.user?.setActivity('Loldle', { type: ActivityType.Playing, url: "https://loldle.net" });
}