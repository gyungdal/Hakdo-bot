const cluster = require('cluster');
const fs = require('fs');
const botToken = require('./token').token;

if (cluster.isMaster) {
	var worker = cluster.fork();
	worker.send({type:"login", token:botToken});
	var temp = [];
	var count = 0;
	
	cluster.on('online', function(worker, code, signal) {
		console.log('worker start : ' + worker.process.pid);
		count = count + 1;
		worker.on('message', function (message) {
			switch(message){
				case "start" :{
					worker.kill();
					worker = cluster.fork();
					worker.send({type:"login", token:botToken});
					break;
				}
				case "kill" : {
					for (const id in cluster.workers) {
						cluster.workers[id].send({type:"kill"});
					}
					process.exit(0);
					break;
				}
				case "realloc" :{
					for (const id in cluster.workers) {
						console.log("realloc command send to -> " + id);
						cluster.workers[id].send({type:"id",id:id});
					}
				}
				default: {
					switch(message.type){
						case "token" :{
							if(message.token != botToken){
								var work = cluster.fork();
								work.send({type:"login", token:message.token});
							}
							break;
						}
						case "realloc":{
							console.log("realloc data send from worker " + message.id);
							var t = {};
							t.id = message.data;
							t.worker = message.id;
							temp.push(t);
							temp = temp.sort(function (a, b) {
									if (a.id > b.id) {
										return 1;
									}
									if (a.id < b.id) {
										return -1;
									}
									return 0;
								});
							console.log("TEMP LENGTH : " + temp.length);
							console.log("cluster.workers LENGTH : " + count);
							if(temp.length == count){
								for(var i = 0;i<temp.length;i++){
									if(i == 0)	continue;
									else{
										if(temp[i-1].id == temp[i].id){
											cluster.workers[temp[i-1].worker].send({type:"message", etc:"kill",data:"Realloc process"});
										}
									}
								}
								temp = [];
							}
							break;
						}
					}
					break;
				}
			}
		});
	});
	
	cluster.on('exit', function(worker, code, signal) {
		console.log('worker is dead : ' + worker.process.pid);
		count = count - 1;
		if(code != 0){
			worker = cluster.fork();
			worker.send({type:"login", token:botToken});
			worker.send('Worker is dead, auto restart start');
		}
	});
	
}

if (cluster.isWorker) {
	const Discord = require('discord.js');
	const client = new Discord.Client();
	var token = null;
	String.prototype.replaceAll = function(target, replacement) {
		return this.split(target).join(replacement);
	};
	
	process.on('message', function(message) {	
		switch(message.type){
			case "login" :{
				console.log("login!");
				token = message.token;
				client.login(message.token);
				break;
			}
			case "kill":{
				process.exit(0);
				break;
			}
			case "message" : {
				console.log(message.data);
				const embed = new Discord.RichEmbed()
					.setTitle("Master Process Message")
					.setColor(0xD50000)
					.setTimestamp()
					.addField("Note", message.data)
					.setFooter("Hakdo bot | Developed by GyungDal", client.user.avatarURL);
				const channel = client.channels.find('name', 'general');
				channel.sendMessage({embed});
				
				if(message.etc == "kill"){
					console.log("die");
					process.exit(0);
				}
				break;
			}
			case "free" :{
				process.exit(0);
				break;
			}
			case "id":{
				console.log("realloc command catch, my id : " + message.id);
				process.send({type:"realloc", id:message.id, data:client.user.id});
				console.log("realloc data send, my id : " + message.id);
				break;
			}
		}
			
		// client.on('ready', () => {	
			// console.log(message);
			// const channel = client.channels.find('name', 'general');
			// channel.sendMessage(message);
		// });
	});	
	
	
	client.on('ready', () => {
		console.log('I am ready!');
		if(client.user.bot){
			console.log("I'm bot");
			if(client.user.id == require('./token').botId){
				console.log("My name is Hakdo bot");
				const bot = require('./bot.js');
				const running = bot(Discord, client);
			}else{
				const channel = client.channels.find('name', 'general');
				channel.sendMessage("This code for Hakdo bot. no running in another bot token.");
				process.exit(0);
			}
		}else{
			const user = require('./user.js');
			const running = user(Discord, client);
		}
	});
	


}
