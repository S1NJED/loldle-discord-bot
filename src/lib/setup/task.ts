import { Client, TextChannel } from "discord.js";
import { PrismaClient } from "@prisma/client";
import { LoldleBot } from "../loldle.js";

export function startTask(client: Client)
{
    // Starting background task to check if it's midnight UTC+2
const TASK_INTERVAL = 60000;
const task = setInterval(async () => 
{
    //                                                                          Adding 20 seconds in case
    const utcPlus2Date = new Date(new Date().getTime() + (2 * 60 * 60 * 1000) + 20*1000);

    // midnight utc+2 so loldle has reset
    if (utcPlus2Date.getUTCHours() === 0)
    {
        const embed = await new LoldleBot().getAnswersEmbed();
        const db = new PrismaClient();
        const channels = await db.guilds.findMany({
            where: {
                text_channel_id: {
                    not: 0
                }
            }
        })

        // Send bulk messages -- 30 req / second -- 10 msg / second
        // Every 1.250 seconds it will try to send 10 msg
        var i = 0;
        const interval = setInterval(() => {
        for (var _ = 0; _ < 10; _++)
        {
            // We exit 
            if (channels[i] === undefined)
                clearInterval(interval);

            const innerInterval = setInterval(async () => {
                // fetch guild
                var guild = client.guilds.cache.get( channels[i].guild_id.toString() );
                if (!guild)
                    guild = await client.guilds.fetch({guild: channels[i].guild_id.toString()});

                // get channel from cache
                var channel = guild.channels.cache.get( channels[i].text_channel_id.toString() ) as TextChannel;
                if (!channel)
                    //@ts-ignore
                    channel = await guild.channels.fetch( channels[i].text_channel_id.toString() ) as TextChannel;
                
                // send message with embed
                await channel.send({
                    embeds: [embed]
                })
                
                // clear interval
                clearInterval(innerInterval);
            },0)
            i++;
        }
    }, 1250)

        
        await db.$disconnect();
        }

    }, TASK_INTERVAL)

    const watcher = setInterval(() => {
        // client is not connected anymore
        if (client.ws.status !== 0)
        {
            clearInterval(task);
            clearInterval(watcher);
        }
    }, 1000)
}