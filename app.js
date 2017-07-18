const cluster = require('cluster');
const fs = require('fs');
const botToken = require('./token').token;
const weatherApiKey = require('./token').weather;
const apiaiKey = require('./token').apiai;
console.log(botToken);

if (cluster.isMaster) {
	var worker = cluster.fork();
	
	String.prototype.replaceAll = function(target, replacement) {
		return this.split(target).join(replacement);
	};
	
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
	const botId = require('./token').botId;
	const uuidFunction = require('uuid-v4');
	const express = require('express');
	const mainduuid = uuidFunction();
	var admins = [require('./token').adminId];
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
	
	//client.on('message', message => {
	//	if(message.content.indexOf('h!weather') == 0){
	//		const request = require('request');
	//		let city = 'portland';
	//		message.content = message.content.replace('  ', ' ');
	//		let url = 'http://api.openweathermap.org/data/2.5/weather?q=' + message.content.split(' ')[1] + '&appid=' + weatherApiKey;
	//		request(url, function (err, response, body) {
	//			if(err){
	//				console.log('error:', error);
	//			} else {
	//				console.log(body);
	//				body = JSON.parse(body);
	//				const weather = body.weather[0].description;
	//				const temp = body.main.temp - 273.15;
	//				const humi = body.main.humidity;
	//				const temp_min = body.main.temp_min - 273.15;
	//				const temp_max = body.main.temp_max - 273.15;
	//				const wind_speed = body.wind.speed;
	//				message.reply(`<Warring!!! - BETA VERSION>\n\n<Weather>\nWEATHER : ${weather}\nTEMP : ${temp}\nHUMI : ${humi}`);
	//				
	//			}
	//		});
	//	}
	//});

	
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
		const userlist = message.mentions.users;
		console.log(userlist);
		userlist.forEach(function(user){
			if(user.id == botId){
				const str = message.content.substring(message.content.lastIndexOf('>') + 1);
				console.log(str);
				const request = require('request');   
				
		const storyId = require('./token').mind;
		const url = "http://mindmap.ai:8000/v1/" + storyId;
		var inputJsonObjectDataInit = {
			"story_id": storyId,
			"context": {
				"conversation_id": mainduuid,
				"information": {
					"conversation_stack": [
						{
							"conversation_node": 'root',
							"conversation_node_name": '루트노드'
						}
					],
					"conversation_counter": 0,
					"user_request_counter": 0,
				},
				"visit_counter": 0,
				"reprompt": false,
				"retrieve_field": false,
				"message": null,
				"keyboard": null,
				"random": false,
				"input_field": false,
				"variables": null
			},
			"input": {
				"text": str
			}
		};
		 
		// request 보내기
		var json = '';
		request({
				url: url,
				method: 'POST',
				json: inputJsonObjectDataInit
		 
			},
			// response 받기
			function(error, response, body){
				console.log("--------- response 시작 ----------");
				console.log(body);
				console.log("--------- response 끝 ----------");
				json = body;
		 
				// 받은 텍스트보기
				var outputTextArray = json["output"]["visit_nodes_text"];
				console.log("outputTextArray: " + outputTextArray.toString());
				for(var i=0 ; i < outputTextArray.length ; i++){
					//실행된 모든 노드의 대답을 표시한다
					console.log(outputTextArray[i]);
				}
		 
		 
				// ** 다시 보낼 payload 재가공하기
				console.log("");
				console.log("--------- 보낼 new_inputJsonObjectData 재가공 시작 ----------");
				var new_inputtxt = str;  // 이부분만 재가공하여 처리하여 다시 메시지를 보내면 된다.
				var new_context = json['context'];
				var new_inputJsonObjectData = {
					"story_id": storyId,
					"context": new_context,
					"input": {
						"text": new_inputtxt
					}
		 
				}
				console.log("받은 context 지만 다시 보낼 context: " + JSON.stringify(new_context));  // 그대로 보내야지 변수들이 유지되어 mindmap이 잘 작동한다.
				console.log("가공후 새롭게 보낼 new_inputtxt: " + new_inputtxt);
				console.log("재가공된  'new_inputJsonObjectData' 이걸 다시 request를 만들어 보내면 된다. : " + JSON.stringify(new_inputJsonObjectData));
				console.log("------------ 보낼 new_inputJsonObjectData 재가공하기 끝 ----------");
				var json = '';
				request({
					url: url,
					method: 'POST',
					json: new_inputJsonObjectData

				},
					// response 받기
					function(error, response, body){;
						if(body["output"]["visit_nodes_name"][0] == '.mr'){
							const urlencode = require('urlencode');
							const request = require('request');
							const naver_client_id = require('./token').naver_client_id;
							const naver_client_secret = require('./token').naver_client_secret;
							var searchURI = ("https://openapi.naver.com/v1/search/encyc.json?query=" + urlencode(str.trim())).trim();
							console.log(searchURI);
							const options = {
								url: searchURI,
								headers: { 
											'X-Naver-Client-Id':naver_client_id, 
											'X-Naver-Client-Secret': naver_client_secret,
											"Content-Type" : "application/json; charset=utf-8"
										}
							};
							request.get(options, function (error, res, body) {
								if (!error) {
									try{
									const json = JSON.parse(body);
										console.log(body);
										message.channel.send('< Search String : ' + str + '>\n\n' 
										+ '======' + json["items"][0]['title'].replace(/<(?:.|\n)*?>/gm, '') + '======\n'
										+ json["items"][0]['description'].replace(/<(?:.|\n)*?>/gm, '')
										+ '\n\n more - ' + json["items"][0]['link']);
									}catch(e){
										request.get({url:'https://namu.wiki/search/' + urlencode(str.trim())}, function (error, res, body){
											const cheerio = require('cheerio');  
											const $ = cheerio.load(body);		
											console.log(body);
											var temp = 0;
											var postElements = $("body > div.content-wrapper > article > section > div");
											postElements.each(function() {
												if(temp > 2)
													return;
												temp = temp + 1;
												const post_title = $(this).find("h4 a").text().trim();
												const post_url = $(this).find("h4 a").attr('href');
												const post_thumb = $(this).find("div").text();
												console.log('title : ' + post_title);
												console.log('url : ' + post_url);
												console.log('thumb : ' + post_thumb);
												
												message.channel.send(`==== TITLE : ${post_title} ====\n\n` + '```\n' +
														`${post_thumb}...` + '```\n' + `\n\nhttps://namu.wiki${post_url}\n`);
											});
										});
										message.channel.send("NOT FOUND...");
									}
								}
								console.log(error);
							});
						}else{
							console.log(body);
							json = body;
							var outputTextArray = json["output"]["visit_nodes_text"];
							console.log("outputTextArray: " + outputTextArray.toString());
							for(var i=0 ; i < outputTextArray.length ; i++){
								//실행된 모든 노드의 대답을 표시한다
								console.log(outputTextArray[i]);
							}
							message.channel.send(json["output"]["text"][0]);
						
								
						}
				});
			});
					 
				//var request = app.textRequest(str, {
				//	sessionId: '1'
				//});
                //
				//request.on('response', function(response) {
				//	console.log(response);
				//	message.reply(response.result.fulfillment.speech);
				//});
                //
				//request.on('error', function(error) {
				//	console.log(error);
				//	message.reply(error);
				//});
                //
				//request.end();
			}
		});
	});
	
	//개복치사 확인용
	process.on('uncaughtException', function (err) {
		const channel = client.channels.find('name', 'general');
		channel.sendMessage('uncaughtException 발생 : ' + err);
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
