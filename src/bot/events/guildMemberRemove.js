const { Event } = require('klasa');
const Bots = require("@models/bots");
const { server: {id, mod_log_id} } = require("@root/config.json");

module.exports = class extends Event {
    async run(member) {
        let bots = await Bots.find({"owners.primary": member.user.id , state: { $ne: "deleted" } }, { _id: false });
        for (let bot of bots) {
            await Bots.updateOne({ botid: bot.botid }, { $set: { state: "deleted" } });
            try {
                let bot_member = await this.client.guilds.cache.get(id).members.fetch(bot.botid)
                bot_member.kick()
                this.channels.cache.get(mod_log_id).send(`<@${bot.botid}> ha sido eliminado por que <@${member.user.id}> (${member.user.tag}) ha salido.`);
            } catch(e) {}
        }
    }
};