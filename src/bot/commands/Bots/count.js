const { Command } = require('klasa');
const Bots = require("@models/bots");

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            name: 'count',
            runIn: ['text'],
            aliases: ["list", "botcount", "bot-count"],
            permLevel: 0,
            botPerms: ["SEND_MESSAGES"],
            requiredSettings: [],
            description: "Comprueba cuántos bots hay en la lista.."
        });
    }

    async run(message) {
        let bots = await Bots.find({}, { _id: false })
        bots = bots.filter(bot => bot.state !== "deleted");
        if (bots.length === 1) message.channel.send(`Hay \`1\` bot en la lista.`)
        else message.channel.send(`Hay \`${bots.length}\` bots en la lista.`)
    }
};
