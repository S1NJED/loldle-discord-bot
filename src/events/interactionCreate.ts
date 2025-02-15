import { Events, Interaction } from "discord.js";

export const name = Events.InteractionCreate;

export async function execute(interaction: Interaction)
{
    if (!interaction.isChatInputCommand()) return;
    
    //@ts-ignore
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command)
    {
        console.error(`No command found (${interaction.commandName})`);
        return;
    }

    try
    {
        await command.execute(interaction);
    }
    catch (err)
    {
        console.error(err);
        if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!' });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!' });
		}
    }
}