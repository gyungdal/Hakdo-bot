const cluster = require('cluster');
const fs = require('fs');
const botToken = require('./token').token;

console.log(botToken);
  
if (cluster.isMaster) {
	var worker = cluster.fork();
	
	worker.on('message', function (message) {
		if(message == "start"){
			worker = cluster.fork();
			worker.send("Restart finish!");
		}
	});
	
	
	cluster.on('online', function(worker, code, signal) {
		console.log("worker restart : " + worker.process.pid);
	});
	
	cluster.on('exit', function(worker, code, signal) {
		console.log("worker is dead : " + worker.process.pid);
	});
	
}


if (cluster.isWorker) {
	const Discord = require('discord.js');
	const client = new Discord.Client();
	
	var sshConnect = false;
	
    var channel;
	process.on('message', function(message) {
		client.on('ready', () => {	
			console.log(message);
			var channel = client.channels.find("name", "general");
			channel.sendMessage(message);
		});
	});	
	
	client.login(botToken);

	client.on('ready', () => {
		console.log('I am ready!');
		sshConnect = false;
	});

	client.on('message', message => {
		//console.log(message);
		if(message.content.indexOf("h!help") == 0){
			message.reply("```\n h!map <ORIGIN> <DEST>\n```");
		}
	});
	
	client.on('message', message => {
		if(message.author.id == 253024615285129227 & 
			message.content.indexOf("h!restart") == 0){
			process.send("start");
			process.exit(0);
		}
	});
	
	client.on('message', message => {
		if(message.author.id == 253024615285129227 & 
		sshConnect == true){
			if(message.content == "h!exit"){
				sshConnect = false;
				message.reply("System logout!!!");
			}else{
				if(message.content.indexOf("!") == 0){
					const { exec } = require('child_process');
					exec(message.content.substring(1), (error, stdout, stderr) =>{
						if(error){
							message.reply("<ERROR>\n" + error);
							return;
						}
						message.reply("<STDOUT>\n" + stdout);
					});
				}
			}
		}
		if(message.author.id == 253024615285129227 &
		message.content.indexOf("h!control") == 0 &
		sshConnect == false){
				message.reply("System ready");
				sshConnect = true;
		}else if(message.content.indexOf("h!control") == 0){
			message.reply("NOP");
		}
	});

}
