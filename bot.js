// For v11 and above only.

const Discord = require('discord.js');
const Music = require("discord.js-musicbot-addon")

class Bot extends Discord.Client {
  constructor(options) {
    super(options);
    this.music = require('discord.js-musicbot-addon');
  }
}

const client = new Bot();

client.on('ready', () => {
    console.log(`[Start] ${new Date()}`);
});

Music.start(client, {
  youtubeKey: "AIzaSyChV72AqgUOWab694WT3zdK6EIbY0EGRuc",
   prefix: "L~", 
    helpCmd: "mhelp",
    global: false, 
    maxQueueSize: 50,
    playCmd: 'music',  
    playAlts: ["music", 'play'],
    volumeCmd: 'vol', 
    thumbnailType: 'high',
    leaveCmd: 'leave',
    anyoneCanSkip: true, 
    disableLoop: false,
    searchCmd: 'search',
    requesterName: true,
    inlineEmbeds: true,     
    queueCmd: 'queue',
    queueAlts: ['queue', 'queueue'],
    pauseCmd: 'pause',
    resumeCmd: 'resume',
    skipCmd: 'skip',
    skipAlts: ["skip", "skipp"],
    loopCmd: 'loop',
    enableQueueStat: true,
    embedColor: 0x5DD500,
});

client.login(process.env.BOT_TOKEN);
