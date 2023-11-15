const { Client, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const pokedex = require('./pokemon.json');
const fs = require('fs');
const axios = require('axios');
const prefix = "mh!"
const crypto = require('crypto');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// Create a new Map to store your commands
client.commands = new Map();

// Load your commands
fs.readdir('./commands/', (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    if (!file.endsWith('.js')) return;
    let props = require(`./commands/${file}`);
    let commandName = file.split('.')[0];
    console.log(`Attempting to load command ${commandName}`);
    client.commands.set(commandName, props);
  });
});

// get Pokemon name 
function getPokemonName(pokemon) {
  return pokemon ? pokemon.name : 'Unknown';
}

// get pokemon types
function getPokemonTypes(pokemon) {
  return pokemon ? pokemon.types.join(', ') : 'Unknown';
}

// get Pokemon color
function getPokemonColor(pokemon) {
  return pokemon && pokemon.color ? pokemon.color.name : 'Unknown';
}


// indicator
function onClientReady() {
  console.log('bots up');
}

async function onMessageCreate(message) {
  try {
    const isMeloetta = message.author.username === 'Meloetta' && message.embeds.length > 0; // checks if the bot's username is Meloetta
    if (isMeloetta) {
      const { image } = message.embeds[0];
    
    

      if (image) {
        const filename = image.url.substring(image.url.lastIndexOf('/') + 1);
        const match = filename.match(/(\d+)([A-Z]+)?/); // handles alternative form pokemon, such as galar, hisui, paldea, alola

        if (match) {
          const [_, pokedexNumber, formPrefix] = match; // matches the image file names
          const formIdentifier = formPrefix ? `${pokedexNumber}${formPrefix}` : pokedexNumber;

          // Read the existing database
          let database = JSON.parse(fs.readFileSync('database.json', 'utf8'));

          // Check if the hash is already in the database
          if (!database[formIdentifier]) {
            // Download the image
            const response = await axios.get(image.url, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(response.data, 'binary');
            // Get the image hash
            const hash = crypto.createHash('sha256').update(buffer).digest('hex');
            // Add the new data to the database
            database[formIdentifier] = hash;
            // Write the updated database back to the file
            fs.writeFileSync('database.json', JSON.stringify(database, null, 2), 'utf8');
          }

          // Now the hash is guaranteed to be in the database, so we can use it
          const hash = database[formIdentifier];

          // get info from the pokedex
          const pokemon = pokedex[formIdentifier];

          let command = message.content.split(' ')[0].slice(prefix.length);
          let args = message.content.split(' ').slice(1);

          

          if (pokemon) {
            const name = getPokemonName(pokemon);
            const types = getPokemonTypes(pokemon);
            const color = getPokemonColor(pokemon);

          let cmd = client.commands.get(command);
          if (cmd) {
            cmd.run(client, message, args, hash, name, types, color);
          }

            const exampleEmbed = {
              color: 0xe7025e,
              title: 'Pokemon Info',
              fields: [
                {
                  name: 'Pokemon Name:',
                  value: `${name}`,
                },
                {
                  name: 'Pokemon Type:',
                  value: `${types}`,
                },
                {
                  name: 'Pokemon Color:',
                  value: `${color}`,
                },
                {
                  name: 'Image Hash:',
                  value: `${hash}`,
                },
              ],
            };

            message.channel.send({ embeds: [exampleEmbed] });
          }
        }
      }
    }
  } catch (error) {
    console.error('Error processing message:', error); // error logger
  }
}
module.exports = {
  getPokemonTypes,
  getPokemonColor,
  getPokemonName
};

// Modify your message event to handle commands
client.on('messageCreate', message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  let command = message.content.split(' ')[0].slice(prefix.length);
  let args = message.content.split(' ').slice(1);

  let cmd = client.commands.get(command);

  if (cmd) {
    cmd.run(client, message, args);
  }
});

// event listeners
client.once(Events.ClientReady, onClientReady);
client.on('messageCreate', onMessageCreate);
 
// login
client.login(token);
