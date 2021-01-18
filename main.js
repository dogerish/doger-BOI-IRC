const readline = require("readline"); // for taking input from terminal
const Discord = require("discord.js");
const client = new Discord.Client(); // bot client
const colors = require("./color-scheme.json");

var config;
// config
try { config = require("./config.json"); }
catch (err) { console.error("Eror: config.json not found"); process.exit(1); }

// enable or disable colors
Object.keys(colors).forEach(key =>
{
	const color = colors[key].split(' ');
	// do use colors
	if (config.color && color.length >= 1)
		colors[key] = color[0];
	else
		colors[key] = color[1] || ((key == 'd') ? '0' : colors.d);
});

var channel; // channel to send stuff to
var lastAuthor;

// color formatting
function format(str)
{
	Object.keys(colors).forEach(key =>
		str = str.replace(RegExp(`<${key}>`, 'g'), `\x1b[${colors[key]}m`)
	);
	return str;
}
// formats and then logs
function flog() { console.log.apply(null, Array.from(arguments).map(arg => format(arg))); }

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
	inDM = (msg.channel.type == "dm");
	// not sent by the bot and in the IRC channel or a DM
	if (msg.author != client.user && (msg.channel == config.channel[1] || inDM))
	{
		lastAuthor = msg.author; // update last author
		// attachments
		let atstr = msg.attachments.map(a => a.url).join('\t');
		atstr = atstr ? `<st>Attachment(s)<d>: <url>${atstr}<d>` : "";
		// content to post
		let content = (msg.content && atstr) ?
			`${msg.content}\n\t${atstr}` :
			(atstr || msg.content);
		flog(`${inDM ? "<st>(DM) " : ""}<t>${msg.author.tag}<d>: ${content}`);
	}
});

// log the bot in
client.login(config.token);
