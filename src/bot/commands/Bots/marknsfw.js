const { Command } = require('klasa');
const Bots = require("@models/bots");

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            aliases: ["nsfw", "toggle-nsfw", "togglensfw"],
            permissionLevel: 8,
            usage: "[User:user]"
        });
    }

    async run(message, [user]) {
        if (!user || !user.bot) return message.channel.send(`Haga ping a un **bot** para marcar como nsfw.`);
        let bot = await Bots.findOne({botid: user.id});
        await Bots.updateOne({ botid: user.id }, {$set: { nsfw: !bot.nsfw } })
        message.channel.send(`👍 \`${user.tag}\` está marcado como ${bot.nsfw ? "no" : ""} NSFW`)
    }
};