const readline = require("readline"); // for taking input from terminal
const Discord = require("discord.js");
const client = new Discord.Client(); // bot client
var config;
// config
try { config = require("./config.json"); }
catch (err) { console.error("Eror: config.json not found"); process.exit(1); }

var channel; // channel to send stuff to
var lastAuthor;

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
	let options = {};
	// commands
	if (input.startsWith('/'))
	{
		let space = input.match(/\s/);
		const command = input.substr(0, space ? space.index : input.length);
		// replace command part of string
		function repcmd(now) { input = input.replace(command, now); }

		switch (command.substr(1))
		{
			// quitting
			case "exit":
			case "quit":
			case "q":
				close();
				return;
			// ping reply to last message
			case "reply":
				// put ping in front of message if there's a last author
				repcmd(lastAuthor || "");
				break;
			// upload file
			case "file":
				options.files = [{ attachment: input.substr(space ? space.index + 1 : input.length) }];
				input = "";
				break;
		}
	}
	channel.send(input, options).catch(console.error);
});

// relay everything from the channel to terminal
client.on('message', msg =>
{
	// not sent by the bot and in the IRC channel
	if (msg.author != client.user && msg.channel == config.channel[1])
	{
		lastAuthor = msg.author; // update last author
		// attachments
		let atstr = msg.attachments.map(a => a.url).join("'\t'");
		atstr = atstr ? `\x1b[1mAttachment(s)\x1b[0m: '${atstr}'` : "";
		// content to post
		let content = (msg.content && atstr) ?
			`${msg.content}\n\t${atstr}` :
			(atstr || msg.content);
		console.log(`\x1b[1m${msg.author.tag}\x1b[0m: ${content}`);
	}
});

// log the bot in
client.login(config.token);
