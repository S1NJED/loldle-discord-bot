import { Events, Guild } from "discord.js";
import { PrismaClient } from "@prisma/client";

export const name = Events.GuildCreate;

export async function execute(guild: Guild)
{
    const db = new PrismaClient();
    try
    {
        await db.guilds.create({
            data: {
                guild_id: parseInt(guild.id as string),
                text_channel_id: 0
            }
        })
        console.log(`Sucessfully added guild (ID: ${guild.id})`);
    }
    catch (err)
    {
        console.error(err);
        console.log("Failed to add guild to database, it probably exists");
    }

    await db.$disconnect();
}