import { PrismaClient } from "@prisma/client"
import { 
    SlashCommandBuilder,
    CommandInteraction,
    SlashCommandChannelOption,
    ChannelType,
    PermissionFlagsBits
} from "discord.js"

export const data = new SlashCommandBuilder()
    .setName("set_channel")
    .setDescription("Set channel to send the answers")
    .addChannelOption((option: SlashCommandChannelOption) => 
        option.setName("text_channel")
                .setRequired(true)
                .setDescription("Choose a text channel where the answers will be sent")
                .addChannelTypes(ChannelType.GuildText))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

export async function execute(interaction: CommandInteraction)
{
    const currentGuildId = parseInt( interaction.guildId as string);
    const textChannel = interaction.options.get("text_channel");
    const textChannelId = parseInt( textChannel?.value as string);

    const db = new PrismaClient();
    await db.guilds.update({
        where: {
            guild_id: currentGuildId
        },
        data: {
            text_channel_id: textChannelId
        }
    })
    await db.$disconnect();
    await interaction.reply(
        `Sucessfully set channel ${textChannel?.channel?.name} `
    );
}
