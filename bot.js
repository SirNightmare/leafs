
const { Client } = require('discord.js');
const yt = require('ytdl-core');
const tokens = require('./tokens.json');
const client = new Client();
const Discord = require(`discord.js`)
let bot = new Discord.Client();
const APIKEY = "AIzaSyChV72AqgUOWab694WT3zdK6EIbY0EGRuc"; // replace me
const { YTSearcher } = require('ytsearcher');
const ytsearcher = new YTSearcher(APIKEY);

let queue = {};

const commands =  {
	'play': (msg) => {
		if (queue[msg.guild.id] === undefined) return msg.channel.sendMessage(`:musical_note: | **Add some songs to the queue first with ${tokens.prefix}add**`);
		if (!msg.guild.voiceConnection) return commands.join(msg).then(() => commands.play(msg));
		if (queue[msg.guild.id].playing) return msg.channel.sendMessage(`:musical_note: | **Already Playing**`);
		let dispatcher;
		queue[msg.guild.id].playing = true;

		console.log(queue);
		(function play(song) {
			console.log(song);
			if (song === undefined) return msg.channel.sendMessage(':musical_note: | **Queue is empty**').then(() => {
				queue[msg.guild.id].playing = false;
				msg.member.voiceChannel.leave();
			});
			let yturl = song.url;
			let ytinfo = yt.getInfo(yturl);
			//msg.channel.sendMessage(`Playing: **${song.title}** as requested by: **${song.requester}**`);
			let Embed = new Discord.RichEmbed()
			.setAuthor(" | Now Playing", client.user.displayAvatarURL)
			.setTitle(`Playing ${song.title}`)
			.addField("Requested by:", song.requester)
			.setTimestamp()
			.setColor("RANDOM")
			msg.channel.sendEmbed(Embed)
			dispatcher = msg.guild.voiceConnection.playStream(yt(song.url, { audioonly: true }), { passes : tokens.passes });
			let collector = msg.channel.createCollector(m => m);
			collector.on('message', m => {
				if (m.content.startsWith(tokens.prefix + 'pause')) {
					msg.channel.sendMessage(':pause_button: | **Paused**').then(() => {dispatcher.pause();});
				} else if (m.content.startsWith(tokens.prefix + 'resume')){
					msg.channel.sendMessage(':arrow_forward: | **Resumed**').then(() => {dispatcher.resume();});
				} else if (m.content.startsWith(tokens.prefix + 'skip')){
					msg.channel.sendMessage(':track_next: | **Skipped**').then(() => {dispatcher.end();});
				} else if (m.content.startsWith('volume+')){
					if (Math.round(dispatcher.volume*50) >= 100) return msg.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
					dispatcher.setVolume(Math.min((dispatcher.volume*50 + (2*(m.content.split('+').length-1)))/50,2));
					msg.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
				} else if (m.content.startsWith('volume-')){
					if (Math.round(dispatcher.volume*50) <= 0) return msg.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
					dispatcher.setVolume(Math.max((dispatcher.volume*50 - (2*(m.content.split('-').length-1)))/50,0));
					msg.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
				} else if (m.content.startsWith(tokens.prefix + 'time')){
					msg.channel.sendMessage(`Time: ${Math.floor(dispatcher.time / 60000)}:${Math.floor((dispatcher.time % 60000)/1000) <10 ? '0'+Math.floor((dispatcher.time % 60000)/1000) : Math.floor((dispatcher.time % 60000)/1000)}`);
				}
			});
			dispatcher.on('end', () => {
				collector.stop();
				play(queue[msg.guild.id].songs.shift());
			});
			dispatcher.on('error', (err) => {
				return msg.channel.sendMessage('error: ' + err).then(() => {
					collector.stop();
					play(queue[msg.guild.id].songs.shift());
				});
			});
		})(queue[msg.guild.id].songs.shift());
	},
	'join': (msg) => {
		    
		return new Promise((resolve, reject) => {
			const voiceChannel = msg.member.voiceChannel;
			if (!voiceChannel || voiceChannel.type !== 'voice') return msg.reply(':musical_note: | I couldn\'t connect to your voice channel...');
			voiceChannel.join().then(connection => resolve(connection)).catch(err => reject(err));
		});
	},
		'add': (msg) => {
			    
			let messsageArray = msg.content.split(" ");
			let command = messsageArray[0];
			let args = messsageArray.slice(1);
			const QUERY = args.join(" "); 
			ytsearcher.search(QUERY, { type: 'video' })
			.then(searchResult => {
			
			  searchResult.nextPage()
			  .then(secondPage => {
				// secondPage is same object as searchResult
			
				const page = secondPage.currentPage;
				const videoEntry = page[1];
			
				//console.log(videoEntry.url);
				yt.getInfo(videoEntry.url, (err, info) => {
					if(err) return msg.channel.sendMessage(':musical_note: | Sorry that link was not valid.');
					if (!queue.hasOwnProperty(msg.guild.id)) queue[msg.guild.id] = {}, queue[msg.guild.id].playing = false, queue[msg.guild.id].songs = [];
					queue[msg.guild.id].songs.push({url: videoEntry.url, title: info.title, requester: msg.author.username});
					let Embed = new Discord.RichEmbed()
					.setAuthor(" | Added To Queue", client.user.displayAvatarURL)
					.setTitle(`Added ${info.title}`)
					.addField("By:", info.author.name)
					.addField("Requested by:", msg.author.username)
					.setThumbnail(info.thumbnail_url)
					.setColor("RANDOM")
					msg.channel.sendEmbed(Embed)
				});
			  });
			});
	},
	'queue': (msg) => {
		   
		if (queue[msg.guild.id] === undefined) return msg.channel.sendMessage(`Add some songs to the queue first with ${tokens.prefix}add`);
		let tosend = [];
		queue[msg.guild.id].songs.forEach((song, i) => { tosend.push(`${i+1}. ${song.title} - Requested by: ${song.requester}`);});
		msg.channel.sendMessage(`__**${msg.guild.name}'s Music Queue:**__ Currently **${tosend.length}** songs queued ${(tosend.length > 15 ? '*[Only next 15 shown]*' : '')}\n\`\`\`${tosend.slice(0,15).join('\n')}\`\`\``);
	},
	'reboot': (msg) => {
		   
		if (msg.author.id == tokens.adminID) process.exit(); //Requires a node module like Forever to work.
	},
	'search': (msg) => {
		  
		let messsageArray = msg.content.split(" ");
		let command = messsageArray[0];
		let args = messsageArray.slice(1);
		const QUERY = args.join(" "); 
		ytsearcher.search(QUERY, { type: 'video' })
		.then(searchResult => {
		
			let result = searchResult.first;
			yt.getInfo(result.url, (err, info) => {
				if(err) return msg.channel.sendMessage(':musical_note: | Sorry that link was not valid.');
				if (!queue.hasOwnProperty(msg.guild.id)) queue[msg.guild.id] = {}, queue[msg.guild.id].playing = false, queue[msg.guild.id].songs = [];
				queue[msg.guild.id].songs.push({url: result.url, title: info.title, requester: msg.author.username});
				let embed = new Discord.RichEmbed()
				.setAuthor(" | Searched", client.user.displayAvatarURL)
				.setColor("RANDOM")
				.setTimestamp()
				.setImage(result.thumbnails.high.url)
				.setTitle("Top Result | Added to the queue")
				.addField(result.title)
				.setFooter(`Requested by ${msg.author.username}`)
				msg.channel.sendEmbed(embed)
			});
		  });
	},


};

client.on('ready', () => {
	console.log('ready!');
});

client.on('message', msg => {
	if (!msg.content.startsWith(tokens.prefix)) return;
	if (commands.hasOwnProperty(msg.content.toLowerCase().slice(tokens.prefix.length).split(' ')[0])) commands[msg.content.toLowerCase().slice(tokens.prefix.length).split(' ')[0]](msg);
});
client.login(process.env.BOT_TOKEN);
