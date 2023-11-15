const { Client, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const pokedex = require('./pokemon.json');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
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

// Event handler for processing messages
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

          // get info from the pokedex
          const pokemon = pokedex[formIdentifier];

          if (pokemon) {
            const name = getPokemonName(pokemon);
            const types = getPokemonTypes(pokemon);
            const color = getPokemonColor(pokemon);

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

// event listeners
client.once(Events.ClientReady, onClientReady);
client.on('messageCreate', onMessageCreate);

// login
client.login(token);
