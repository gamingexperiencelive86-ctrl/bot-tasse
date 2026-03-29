require('dotenv').config();

const express = require('express');
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

// SERVER WEB PER RENDER
const app = express();

app.get('/', (req, res) => {
  res.send('Bot attivo');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server web attivo sulla porta ${PORT}`);
});

// BOT DISCORD
const TOKEN = process.env.TOKEN;

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

function calcolaTasse(totale, ritardo) {
  let percentuale = 0;

  if (ritardo === 0) {
    percentuale = 15;
  } else if (ritardo === 1 || ritardo === 2) {
    percentuale = 30;
  } else if (ritardo >= 3) {
    percentuale = 50;
  }

  const tassaDaPagare = totale * (percentuale / 100);

  return {
    percentuale,
    tassaDaPagare
  };
}

client.once('ready', () => {
  console.log(`ONLINE COME ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== 'tasse') return;

  try {
    await interaction.deferReply();

    const attivita = interaction.options.getString('attivita');
    const totale = interaction.options.getNumber('totale');
    const ritardo = interaction.options.getInteger('ritardo');

    if (!attivita || attivita.trim() === '') {
      await interaction.editReply('Errore: nome attività mancante.');
      return;
    }

    if (totale === null || Number.isNaN(totale) || totale <= 0) {
      await interaction.editReply('Errore: il totale deve essere maggiore di 0.');
      return;
    }

    if (ritardo === null || Number.isNaN(ritardo) || ritardo < 0) {
      await interaction.editReply('Errore: i giorni di ritardo non possono essere negativi.');
      return;
    }

    const risultato = calcolaTasse(totale, ritardo);

    const embed = new EmbedBuilder()
      .setTitle('Los Santos Department of Economics & Finance')
      .setDescription('Calcolo tassa attività con mora')
      .setColor(0xD4AF37)
      .addFields(
        { name: '🏢 Attività', value: attivita, inline: true },
        { name: '💰 Totale dichiarato', value: `€${totale.toFixed(2)}`, inline: true },
        { name: '📅 Giorni di ritardo', value: `${ritardo}`, inline: true },
        { name: '📊 Percentuale tassa', value: `${risultato.percentuale}%`, inline: true },
        { name: '🧾 Tassa da pagare', value: `€${risultato.tassaDaPagare.toFixed(2)}`, inline: true },
        { name: '📌 Regole', value: '0 giorni = 15% • 1-2 giorni = 30% • 3+ giorni = 50%' }
      )
      .setFooter({ text: 'Dipartimento Economia e Finanze • Los Santos' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('ERRORE NEL COMANDO /tasse:', error);

    try {
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply('Errore durante il calcolo delle tasse.');
      } else {
        await interaction.reply({
          content: 'Errore durante il calcolo delle tasse.',
          ephemeral: true
        });
      }
    } catch (secondError) {
      console.error('ERRORE DURANTE LA RISPOSTA DI ERRORE:', secondError);
    }
  }
});

client.on('error', (error) => {
  console.error('ERRORE CLIENT DISCORD:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION:', error);
});

console.log('TOKEN:', TOKEN ? 'OK' : 'NON TROVATO');

client.login(TOKEN).catch((error) => {
  console.error('ERRORE LOGIN DISCORD:', error);
});