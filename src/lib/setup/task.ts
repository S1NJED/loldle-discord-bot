import { Client, TextChannel } from "discord.js";
import { PrismaClient } from "@prisma/client";
import { LoldleBot } from "../loldle.js";

export function startTask(client: Client)
{
    // Starting background task to check if it's midnight UTC+2
    const TASK_INTERVAL = 30000;
    var ALREADY_SENT = false;

    const task = setInterval(async () => 
    {
        //                                                                        Adding 60 seconds in case
        const utcPlus2Date = new Date(new Date().getTime() + (2 * 60 * 60 * 1000) + 60*1000);

        // midnight utc+2 so loldle has reset
        if (utcPlus2Date.getUTCHours() === 0)
        {
            if (ALREADY_SENT)
                return;
            ALREADY_SENT = true;

            const dataTest = [
                { gameType: 'classic', answer: 'Graves' },
                { gameType: 'quote', answer: 'Dr. Mundo' },
                { gameType: 'ability', answer: 'Nilah' },
                { gameType: 'emoji', answer: 'Yorick' },
                { gameType: 'splash', answer: 'Corki' }
            ]

            const embed = await new LoldleBot().getAnswersEmbed();
            const db = new PrismaClient();
            const guilds = await db.guilds.findMany({
                where: {
                    text_channel_id: {
                        not: 0
                    }
                }
            })
            await db.$disconnect();


            // Send bulk messages -- 30 req / second -- 10 msg / second
            // Every 1.250 seconds it will try to send 10 msg
            var i = 0;
            guilds.forEach(async (guild, index) => 
            {
                const currGuild = guild;

                new Promise(async (resolve) => {
                    // fetch guild
                    var guild = client.guilds.cache.get( currGuild.guild_id.toString() );
                    if (!guild)
                        guild = await client.guilds.fetch({guild: currGuild.guild_id.toString()});

                    // get channel from cache
                    var channel = guild.channels.cache.get( currGuild.text_channel_id.toString() ) as TextChannel;
                    if (!channel)
                        //@ts-ignore
                        channel = await guild.channels.fetch( currGuild.text_channel_id.toString() ) as TextChannel;
                    
                    // send message with embed
                    await channel.send({
                        embeds: [embed]
                    })
                    
                    // clear interval
                    resolve(0);
                })

                // If 10 innerInterval were created we wait 1 seconds before keep continuing
                if (i >= 10)
                {
                    i = 0;
                    await new Promise(resolve => setTimeout(resolve, 1100));
                }

                i++;

            })

        }
        else
        {
            ALREADY_SENT = false;
        }

    }, TASK_INTERVAL);


    // when client is off we clear
    const watcher = setInterval(() => 
    {
        // client is not connected anymore
        if (client.ws.status !== 0)
        {
            clearInterval(task);
            clearInterval(watcher);
        }
    }, 1000)
}