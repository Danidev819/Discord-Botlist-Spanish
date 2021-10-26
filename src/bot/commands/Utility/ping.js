const { Command } = require('klasa');

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            runIn: ['text'],
            aliases: ["pong", "latency"],
            description: "Verifica la latencia del bot",
        });
    }

    async run(message, [...params]) {
        let now = Date.now()
        let m = await message.channel.send(`Pinging...`);
        m.edit(`Pong! \`${Date.now() - now}\`ms`)
    }

};