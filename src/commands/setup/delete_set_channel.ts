import { 
    SlashCommandBuilder, 
    CommandInteraction,
    PermissionFlagsBits
} from "discord.js"

import { PrismaClient } from "@prisma/client";

export const data = new SlashCommandBuilder()
    .setName("delete_set_channel")
    .setDescription("Delete the set up channel if it exists")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

export async function execute(interaction: CommandInteraction)
{
    const currGuildId = parseInt(interaction.guildId as string);
    const db = new PrismaClient();
    await db.guilds.update({
        where: {
            guild_id: currGuildId
        },
        data: {
            text_channel_id: 0
        }
    })
    await db.$disconnect();
    await interaction.reply(`Sucessfully removed the channel, you will not receive the answers anymore ...`);
}
