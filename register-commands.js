require('dotenv').config();

const { SlashCommandBuilder, REST, Routes } = require('discord.js');

const TOKEN = process.env.TOKEN;
const CLIENT_ID = '1487569612991107233';
const GUILD_ID = '1485771426140262412';

const commands = [
  new SlashCommandBuilder()
    .setName('tasse')
    .setDescription('Calcola la tassa da pagare con mora')
    .addStringOption(option =>
      option
        .setName('attivita')
        .setDescription('Nome attività')
        .setRequired(true)
    )
    .addNumberOption(option =>
      option
        .setName('totale')
        .setDescription('Totale dichiarato dell’attività')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('ritardo')
        .setDescription('Giorni di ritardo')
        .setRequired(true)
    )
    .toJSON()
];

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log('Registrazione comando /tasse...');
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log('Comando /tasse registrato con successo.');
  } catch (error) {
    console.error('Errore registrazione:', error);
  }
})();