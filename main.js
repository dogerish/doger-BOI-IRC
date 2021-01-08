const readline = require("readline"); // for taking input from terminal
const Discord = require("discord.js");
const client = new Discord.Client(); // bot client
var config;
// config
try { config = require("./config.json"); }
catch (err) { console.error("Eror: config.json not found"); process.exit(1); }

var channel; // channel to send stuff to

client.on('ready', async () =>
{
	try
	{
		let guild = await client.guilds.resolve(config.channel[0]);
		channel = await guild.channels.resolve(config.channel[1]);
	}
	catch (err) { console.error("Failed to get channel!", err); }
	console.log("Ready.");
});

const rl = readline.createInterface
({
	input: process.stdin,
	output: process.stdout
});

// close everything
function close() { client.destroy(); rl.close(); }

// closing with ctrl-d or ctrl-c
rl.on("close", close);

// relay every line to discord
rl.on("line", input =>
{
	// quitting
	if (input == "/exit" || input == "/quit" || input == "/q")
		close();
	else
		channel.send(input).catch(console.error);
});

// relay everything from the channel to terminal
client.on('message', msg =>
{
	// not sent by the bot and in the IRC channel
	if (msg.author != client.user && msg.channel == config.channel[1])
		console.log(`${msg.author.username}: ${msg.content}`);
});

// log the bot in
client.login(config.token);
