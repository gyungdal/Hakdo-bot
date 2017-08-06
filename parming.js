const Discord = require('discord.js');
const client = new Discord.Client();
const token = require('./token').adminToken;
const defaultId = require('./token').adminId;

client.login(token);

client.on('ready', () => {
	console.log('I am ready!');
});

client.on('message', message => {
	if(message.content.indexOf('h!parming') == 0 & message.author.id == defaultId){
			message.channel.send('t!daily');
			message.channel.send('t!rep <@243755957333524480>');
		var interval = setInterval(() => {
			message.channel.send('t!daily');
			message.channel.send('t!rep <@243755957333524480>');
		}, (1000 * 3600 * 24) + 1000);
	}
});