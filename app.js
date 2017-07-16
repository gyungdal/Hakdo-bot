const cluster = require('cluster');
const fs = require('fs');
const botToken = require('./token').token;
const weatherApiKey = require('./token').weather;
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

if (cluster.isWorker) {
	const Discord = require('discord.js');
	const client = new Discord.Client();
	var admins = ["253024615285129227"];
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
		if(message.content.indexOf('h!weather') == 0){
			const request = require('request');
			let city = 'portland';
			message.content = message.content.replace('  ', ' ');
			let url = 'http://api.openweathermap.org/data/2.5/weather?q=' + message.content.split(' ')[1] + '&appid=' + weatherApiKey;
			request(url, function (err, response, body) {
				if(err){
					console.log('error:', error);
				} else {
					console.log(body);
					body = JSON.parse(body);
					const weather = body.weather[0].description;
					const temp = body.main.temp - 273.15;
					const humi = body.main.humidity;
					const temp_min = body.main.temp_min - 273.15;
					const temp_max = body.main.temp_max - 273.15;
					const wind_speed = body.wind.speed;
					message.reply(`<Warring!!! - BETA VERSION>\n\n<Weather>\nWEATHER : ${weather}\nTEMP : ${temp}\nHUMI : ${humi}`);
					
				}
			});
		}
	});

	client.on('message', message => {
		//console.log(message);
		if(message.content.indexOf('h!help') == 0){
			message.reply('<관리자 전용>\n```\nh!exec <COMMAND> : Command Run\nh!kill : Suicide\nh!restart : Restart Hakdo bot\n' +
			'h!python <Code> : Python Execute\n' +
			'```\n\n<일반 사용자용>```' +
			'h!ssh -url <URL> -p <PORT> -user <USER> ' +
			': SSH connect\nh!macro <Value> <Count> ' + 
			': Sent the specified number of times\n' +
			'h!pid : View Hakdo bot pid!\n' +
			'h!weather <city name in eng> : <BETA> get weather```');
		}
	});
	
	
	client.on('message', message => {
		const uuid = message.content.substring(message.content.lastIndexOf('<@') + 2, message.content.lastIndexOf('>'));
		if(message.content.indexOf('h!admin ') == 0 & admins.indexOf(message.author.id) == 0){
			if(admins.indexOf(uuid) == -1){
				admins.push(uuid);
				message.reply("NEW ADMIN : <@" + uuid + '>');
			}
		}
	});
	
	client.on('message', message => {
		if(message.content.indexOf('h!adminList') == 0 & admins.indexOf(message.author.id) == 0){
			var temp = "";
			admins.forEach(function(value){
				temp = temp + "<@" + value + '> ';
			});
			message.reply('\n\n<ADMIN LIST>\n' + temp);
		} 
	});
	
	client.on('message', message => {
		if(message.content.indexOf('h!pid') == 0){
			console.log(process.pid);
			message.reply("\nPID : " + process.pid);
		} 
	});
	
	
	client.on('message', message => {
		if(message.content.indexOf('h!logoutAll') == 0 & admins.indexOf(message.author.id) == 0){
			for(var i in admins){
				if(i == 0)
					continue;
				delete admins[i];
			}
			message.reply("DELETE ALL CUSTOM ADMIN\n");
		}
	});
	
	client.on('message', message => {
		const uuid = message.content.substring(message.content.lastIndexOf('<@') + 2, message.content.lastIndexOf('>'));
		if(message.content.indexOf('h!logout ') == 0 & admins.indexOf(message.author.id) == 0){
			if(admins.indexOf(uuid) > 0){
				delete admins[admins.indexOf(uuid)];
				message.reply("DELETE ADMIN : <@" + uuid + '>');
			}
		}
	});
	
	client.on('message', message => {
		//console.log(message);
		if(message.content.indexOf('h!macro') == 0){
			
			const value = message.content.substring(message.content.indexOf(" "), message.content.lastIndexOf(" ")).trim();
			console.log(value);
			if(value.indexOf("h!") != -1){
				message.reply("NOP!");
				return;
			}
			if(value.indexOf(admins[0]) != -1){
				message.reply("NOP!!!!!!!!!!!!!!!!!!!!!!!!!!!");
				return;
			}
			const time = message.content.substring(message.content.lastIndexOf(' ') + 1).trim();
			if(time < 0)
				return;
			const channel = client.channels.find('name', 'general');
			for(var i = 1;i<=time;i++){
				channel.sendMessage(value);
			}
		}
	});
	
	
	client.on('message', message => {
		if(admins.indexOf(message.author.id) == 0 & 
			message.content.indexOf('h!coin') == 0){
			const channel = client.channels.find('name', 'general');
			channel.sendMessage('t!daily <@' + admins[0] + '>');
		}
	});
	
	client.on('message', message => {
		if(admins.indexOf(message.author.id) != -1 & 
			message.content.indexOf('h!kill') == 0){
			process.send('kill');
			process.exit(0);
		}
	});
	
	client.on('message', message => {
		if(admins.indexOf(message.author.id) != -1 & 
			message.content.indexOf('h!restart') == 0){
			process.send('start');
			process.exit(0);
		}
	});
	
	
	client.on('message', message => {
		if(admins.indexOf(message.author.id) != -1 &
		message.content.indexOf('h!python') == 0){
			const command = message.content.replace('h!python', '').trim();
			console.log(command);
			fs.writeFile('/Users/gyungdal/Hakdo bot/temp.py', command, function(err) {
				if(err) throw err;
				console.log('File write completed');
			});
			exec("python '/Users/gyungdal/Hakdo bot/temp.py'", (error, stdout, stderr) =>{
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
		if(admins.indexOf(message.author.id) != -1 &
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
		if(admins.indexOf(message.author.id) != -1 & 
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