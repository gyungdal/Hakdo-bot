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
			for (var i in cluster.workers) {
				if (i == 0)
					continue;
				cluster.workers[i].kill();
			}
		}else if(message == 'kill'){
			for (var i in cluster.workers) {
				cluster.workers[i].kill();
			}
			process.exit(0);
		}
	});
	
	
	cluster.on('online', function(worker, code, signal) {
		console.log('worker restart : ' + worker.process.pid);
	});
	
	cluster.on('exit', function(worker, code, signal) {
		console.log('worker is dead : ' + worker.process.pid);
		if(code != 0){
			worker = cluster.fork();
			worker.send('Worker is dead, auto restart start');
		}
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
			const channel = client.channels.find('name', 'general');
			for(var i = 1;i<=time;i++){
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
		message.content.indexOf('h!exec') == 0){
			console.log(message.content.replace('h!exec', '').trim());
			exec(message.content.replace('h!exec', '').trim(), (error, stdout, stderr) =>{
				if(error){
					message.reply('<ERROR>\n' + error);
					return;
				}
				console.log(stdout);
				message.reply('<STDOUT>\n' + stdout);
			});
		}
	});
	
	client.on('message', message => {
		if(message.author.id == 253024615285129227 & 
			message.content.indexOf('h!sshList') == 0){
			message.reply(sshConnect);
		}
	});
	
	var sshConnect = {};
	var seq = {};
	
	client.on('message', message => {
		var url, user, port;
		if(message.content.indexOf('h!ssh ') == 0){
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
			if(url.indexOf("@") != -1){
				user = url.split("@")[0];
				url = url.split("@")[1];
			}
			//h!ssh -url gyungdal.iptime.org -p 24 -user gyungdal -pw aa1003
			// const channel = client.channels.find('name', 'general');
			// channel.sendMessage(require('util').format('%s:%d -u %s -p %s', url, port, user, pw));
			if(typeof url != 'undefined' & typeof user != 'undefined'){
				if(typeof port == 'undefined'){
					port = 22;
				}
				const pty = require("pty.js");
				seq[message.author.id] = pty.spawn("ssh", [user + "@" + url, "-p", port]);

				seq[message.author.id].on("data", function(data) {
					message.reply(data);
				});
				sshConnect[message.author.id] = true;
			}
		}
		if(message.content.indexOf('!') == 0 & sshConnect[message.author.id] == true){
			if(message.content.indexOf('!exit') == 0){
				seq[message.author.id].write('exit\r\n');
				delete sshConnect[message.author.id];
				message.reply("ssh close");
				delete seq[message.author.id];
			}else{
				seq[message.author.id].write(message.content.substring(1) + '\r\n');
			}
		}
	});

}
