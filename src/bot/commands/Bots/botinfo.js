const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const Bots = require("@models/bots");


module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            aliases: ["bot-info", "info"],
            usage: '[User:user]'
        });
    }

    async run(message, [user]) {
        if (!user || !user.bot) return message.channel.send(`Haga ping a un **bot** para obtener información sobre.`);
        if (user.id === message.client.user.id) return message.channel.send(`-_- No`);

        const bot = await Bots.findOne({ botid: user.id }, { _id: false })
        if (!bot) return message.channel.send(`Bot no encontrado.`);
        let servers;
        if (bot.servers[bot.servers.length - 1])
            servers = bot.servers[bot.servers.length - 1].count;
        else servers = null;
        const botUser = await this.client.users.fetch(user.id);
        if (bot.logo !== botUser.displayAvatarURL({format: "png", size: 256}))
            await Bots.updateOne({ botid: user.id }, {$set: {logo: botUser.displayAvatarURL({format: "png", size: 256})}});
        let e = new MessageEmbed()
            e.setColor(0x6b83aa)
            e.setAuthor(bot.username, botUser.displayAvatarURL({format: "png", size: 256}), bot.invite)
            e.setDescription(bot.description)
            e.addField(`Prefix`, bot.prefix ? bot.prefix : "Desconocido", true)
            e.addField(`Servidor de soporte`, !bot.support ? "No añadido" : `[Click Aquí](${bot.support})`, true)
            e.addField(`Sitio web`, !bot.website ? "No añadido" : `[Click Aquí](${bot.website})`, true)
            e.addField(`Github`, !bot.github ? "No añadido" : `[Click Aquí](${bot.github})`, true)
            e.addField(`Likes`, `${bot.likes || 0} Likes`, true)
            e.addField(`Recuento de servidores`, `${servers || 0} Servers`, true)
            e.addField(`Owner`, `<@${bot.owners.primary}>`, true)
            e.addField(`Estado`, bot.state, true)
        message.channel.send(e);
    }
};