const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const Bots = require("@models/bots");

const { server: {id} } = require("@root/config.json");

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            aliases: ["q"],
            permissionLevel: 8,
        });
    }

    async run(message) {
        let cont = "";
        let bots = await Bots.find({ state: "unverified" }, { _id: false })

        bots.forEach(bot => { cont += `<@${bot.botid}> : [Invitar](https://discord.com/oauth2/authorize?client_id=${bot.botid}&scope=bot&guild_id=${id}&permissions=0)\n` })
        if (bots.length === 0) cont = "La cola está vacía";

        let embed = new MessageEmbed()
            .setTitle('Cola')
            .setColor(0x6b83aa)
            .setDescription(cont)
        message.channel.send(embed)
    }
};