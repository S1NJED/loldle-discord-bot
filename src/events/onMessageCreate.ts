import { Events, Message } from "discord.js";
import { LoldleBot } from "../lib/loldle";

export const name = Events.MessageCreate;

export async function execute(message: Message)
{
    if (message.content === "!answers" && process.env.DEV_USERS_ID?.includes(message.author.id) )
    {
        await message.reply("Starting to search the answers ...");
        const bot = new LoldleBot();
        const embed = await bot.getAnswersEmbed();
        await message.reply({
            embeds: [embed]
        })
    }
}