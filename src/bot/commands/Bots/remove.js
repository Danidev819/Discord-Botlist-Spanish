const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const Bots = require("@models/bots");

const { server: {mod_log_id, role_ids} } = require("@root/config.json");

const reasons = {
    "1": `Tu bot estaba desconectado cuando intentamos verificarlo.`,
    "2": `Tu bot es un clon de otro bot`,
    "3": `Tu bot responde a otros bots`,
    "4": `Tu bot no tiene suficientes comandos que funcionen. (Mínimo: 7)`,
    "5": `Su bot tiene comandos NSFW que funcionan en canales no marcados con NSFW`,
    "6": `Su bot no tiene un comando de ayuda o una lista de comandos que funcione`
}
var modLog;

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            name: 'remove',
            runIn: ['text'],
            aliases: ["delete"],
            permissionLevel: 8,
            botPerms: ["SEND_MESSAGES"],
            description: "Eliminar un bot de la lista de bots",
            usage: '[Member:user]'
        });
    }

    async run(message, [Member]) {
        if (!Member || !Member.bot) return message.channel.send(`No hiciste ping a un bot para eliminar.`)
        let e = new MessageEmbed()
            .setTitle('Razones')
            .setColor(0x6b83aa)
            .addField(`Eliminando bot`, `${Member}`)
        let cont = ``;
        for (let k in reasons) {
            let r = reasons[k];
            cont += ` - **${k}**: ${r}\n`
        }
        cont += `\nIngrese un número de motivo válido o su propio motivo.`
        e.setDescription(cont)
        message.channel.send(e);
        let filter = m => m.author.id === message.author.id;

        let collected = await message.channel.awaitMessages(filter, { max: 1, time: 20000, errors: ['time'] });
        let reason = collected.first().content
        let r = collected.first().content;
        if (parseInt(reason)) {
            r = reasons[reason]
            if (!r) return message.channel.send("Número de motivo no válido.")
        }

        let bot = await Bots.findOne({ botid: Member.id }, { _id: false });
        await Bots.updateOne({ botid: Member.id }, { $set: { state: "deleted", owners: {primary: bot.owners.primary, additional: []} } });
        const botUser = await this.client.users.fetch(Member.id);

        if (!bot) return message.channel.send(`Error desconocido. Bot no encontrado.`)
        let owners = [bot.owners.primary].concat(bot.owners.additional)
        e = new MessageEmbed()
            .setTitle('Bot eliminado')
            .addField(`Bot`, `<@${bot.botid}>`, true)
            .addField(`Owner`, owners.map(x => x ? `<@${x}>` : ""), true)
            .addField("Mod", message.author, true)
            .addField("Razon", r)
            .setThumbnail(botUser.displayAvatarURL({format: "png", size: 256}))
            .setTimestamp()
            .setColor(0xffaa00)
        modLog.send(e)
        modLog.send(owners.map(x => x ? `<@${x}>` : "")).then(m => { m.delete() });
        message.channel.send(`El bot <@${bot.botid}> ha sido removido Chequee <#${mod_log_id}>.`)
        
        owners = await message.guild.members.fetch({user: owners})
        owners.forEach(o => {
            o.send(`Tu bot ${bot.username} ha sido removido:\n>>> ${r}`)
        })
        if (!message.client.users.cache.find(u => u.id === bot.botid).bot) return;
        try {
            message.guild.members.fetch(message.client.users.cache.find(u => u.id === bot.botid))
                .then(bot => {
                    bot.kick().then(() => {})
                        .catch(e => { console.log(e) })
                }).catch(e => { console.log(e) });
        } catch (e) { console.log(e) }
    }

    async init() {
        modLog = await this.client.channels.fetch(mod_log_id);
    }
};
