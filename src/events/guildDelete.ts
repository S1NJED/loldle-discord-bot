import { Events, Guild } from "discord.js";
import { PrismaClient } from "@prisma/client";

export const name = Events.GuildDelete;

export async function execute(guild: Guild)
{
    const currGuildId = BigInt(guild.id as string);
    const db = new PrismaClient();
    await db.guilds.update({
        where: {
            guild_id: currGuildId
        },
        data: {
            text_channel_id: 0
        }
    })
    console.log(`onGuildDelete success`);
    await db.$disconnect();
}