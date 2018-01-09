module.exports = function(Discord, client){
	console.log("I'm user!");	
	var rep = '', daily = '';
	var pinterval;
	var autoLevelup = false, cinterval, before, cChannel;
	
	client.on('message', message => {
		if(message.author.id == client.user.id){
			if(message.channel.id != cChannel){
				before = message.createdTimestamp; 
				console.log("현재 TIMESTAMP : " + before);
			}
			console.log(message.channel.id);
			const a = message.content.indexOf(' ') != -1 ? message.content.indexOf(' ') : message.content.length;
			switch(message.content.substring(message.content.indexOf('!') + 1, a)){
				case "parming" :{
						message.channel.send('t!daily' + (daily != '' ? daily : ''));
						if(rep != '')
							message.channel.send('t!rep ' + rep);
						pinterval = setInterval(function(){
							message.channel.send('t!daily' + (daily != '' ? daily : ''));
							if(rep != '')
								message.channel.send('t!rep ' + rep);
						}, (1000 * 3600 * 24) + 5000);				
						break;		
				}
				case "stop":{
					clearInterval(pinterval);
					pinterval = null;
					message.channel.send("stop parming");
					break;
				}
				case "status":{
					const embed = new Discord.RichEmbed()
						.setTitle("I'm Alive!!!")
						.setColor(0x76FF03)
						.setTimestamp()
						.addField("Interval Status", (pinterval != null ? "Running" : "Stop"))
						.addField("Daily Target", (daily != '' ? daily : "No target"))
						.addField("Rep Target", (rep != '' ? rep : "No target"))
						.addField("Parming Status", (cinterval != null ? "Running" : "Stop"))
						.setFooter(client.user.tag + " | Running on Hakdo bot", client.user.avatarURL);
					message.channel.send({embed});	
					break;
				}
				case "enable" :{
					console.log("레벨업 활성화!");
					if(autoLevelup){
						message.channel.send("이미 활성화 되어 있습니다");
					}else{
						autoLevelup = true;
						cChannel = message.channel;
						cinterval = setInterval(function(){
							console.log("현재 시간 : " + (new Date().getTime()));
							if((before + (10 * 1000)) < (new Date().getTime())){	
								console.log("10초 지남!, 레벨업 시작!");
								if(autoLevelup){
									const casual = require('casual');
									cChannel.send(casual.text);
								}
							}
						}, 1200);
					}
					break;
				}
				case "disable" : {
					console.log("레벨업 비활성화...");
					if(autoLevelup){
						autoLevelup = false;
						cChannel = null;
						clearInterval(cinterval);
						cinterval = null;
						message.channel.send("Level up Done");
					}else{
						message.channel.send("???");
					}
					break;
				}
				default : break;
			}
		}
	});
		
	client.on('message', message => {
		if(message.author.id == client.user.id){
			const a = message.content.indexOf(' ') != -1 ? message.content.indexOf(' ') : message.content.length;
			switch(message.content.substring(message.content.indexOf('!') + 1, a)){
				case 'setRep' : {
					rep = message.content.substring(message.content.indexOf(' <'), message.content.indexOf('>') + 1).trim();
					message.channel.send("rep : " + rep);
					console.log("req : " + rep);	
					break;
				}
				case 'clearRep' : {								
					rep = '';
					console.log("repClear");
					message.channel.send("repClear");
				}
				case 'setDaily' : {
					daily = message.content.substring(message.content.indexOf(' <'), message.content.indexOf('>') + 1).trim();
					message.channel.send("daily : " + daily);
					console.log("daily : " + daily);	
					break;
				}
				case 'clearDaily' : {								
					daily = '';
					console.log("daily Clear");
					message.channel.send("dailyClear");
				}
				default : break;
			}
		}
	});
}
