const cluster = require('cluster');
const fs = require('fs');
const botToken = require('./token').token;

console.log(botToken);
  
if (cluster.isMaster) {
	var worker = cluster.fork();
	
	worker.on('message', function (message) {
		if(message == 'start'){
			worker = cluster.fork();
			worker.send('Restart finish!');
		}else if(message == 'kill'){
			for (var id in cluster.workers) {
				cluster.workers[id].kill();
			}
			process.exit(0);
		}
	});
	
	
	cluster.on('online', function(worker, code, signal) {
		console.log('worker restart : ' + worker.process.pid);
	});
	
	cluster.on('exit', function(worker, code, signal) {
		console.log('worker is dead : ' + worker.process.pid);
		worker = cluster.fork();
		worker.send('Worker is dead, auto restart start');
	});
	
}

var term;
if (cluster.isWorker) {
	const Discord = require('discord.js');
	const client = new Discord.Client();
		
	var exec = require('child_process').exec;
	
	process.on('message', function(message) {
		client.on('ready', () => {	
			console.log(message);
			var channel = client.channels.find('name', 'general');
			channel.sendMessage(message);
		});
	});	
	
	client.login(botToken);

	client.on('ready', () => {
		console.log('I am ready!');
	});

	client.on('message', message => {
		//console.log(message);
		if(message.content.indexOf('h!help') == 0){
			message.reply('h!exec <COMMAND> : Command Run\nh!ssh -url <URL> -p <PORT> -user <USER> ' +
			': SSH connect\nh!kill : Suicide\nh!restart : Restart Hakdo bot\nh!macro <Value> <Count> ' + 
			': Sent the specified number of times\n');
		}
	});
	
	client.on('message', message => {
		//console.log(message);
		if(message.content.indexOf('h!macro') == 0){
			const value = message.content.split(' ')[1];
			if(value.indexOf("h!") != -1){
				message.reply("NOP!");
				return;
			}
			const time = message.content.split(' ')[2];
			if(time < 0)
				return;
			for(var i = 1;i<=time;i++){
				const channel = client.channels.find('name', 'general');
				channel.sendMessage(value);
			}
		}
	});
	
	client.on('message', message => {
		if(message.author.id == 253024615285129227 & 
			message.content.indexOf('h!kill') == 0){
			process.send('kill');
			process.exit(0);
		}
	});
	client.on('message', message => {
		if(message.author.id == 253024615285129227 & 
			message.content.indexOf('h!restart') == 0){
			process.send('start');
			process.exit(0);
		}
	});
	
	client.on('message', message => {
		if(message.author.id == 253024615285129227 &
		message.content.indexOf('h!exec') == 0)
		exec(message.content.split(' ')[1], (error, stdout, stderr) =>{
			if(error){
				message.reply('<ERROR>\n' + error);
				return;
			}
			message.reply('<STDOUT>\n' + stdout);
		});
	});
	var sshConnect;
	var seq;
	
	client.on('message', message => {
		var url, user, port;
		if(message.content.indexOf('h!ssh') == 0){
			console.log('SSH');
			const argv = message.content.split(' ');
			console.log(argv);
			var before = '';
			for(var value in argv){
				value = argv[value];
				switch(before){
					case '-url' : 
						url = value; 
						console.log('URL : ' + url);
						break;
					case '-p' : 
						port = value; 
						console.log('PORT : ' + url);
						break;
					case '-user' : 
						user = value; 
						console.log('USER : ' + url);
						break;
				}
				console.log(value);
				before = value;
			}
			//h!ssh -url gyungdal.iptime.org -p 24 -user gyungdal -pw aa1003
			// const channel = client.channels.find('name', 'general');
			// channel.sendMessage(require('util').format('%s:%d -u %s -p %s', url, port, user, pw));
			if(typeof url != 'undefined' & typeof user != 'undefined'){
				if(typeof port == 'undefined'){
					port = 22;
				}
				const pty = require("pty.js");
				term = pty.spawn("ssh", [user + "@" + url, "-p", port]);

				term.on("data", function(data) {
					message.reply(data);
				});
				
				sshConnect = true;
			}
		}
		if(message.content.indexOf('!') == 0 & sshConnect == true){
			if(message.content.indexOf('!exit') == 0){
				term.write('exit\r\n');
				sshConnect = false;
				message.reply("ssh close");
			}else{
				term.write(message.content.substring(1) + '\r\n');
			}
		}
	});

}
