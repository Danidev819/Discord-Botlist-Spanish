const recaptcha2 = require('recaptcha2')
const is = require('is-html');

const { server: { id }, bot_options: {
    max_owners_count,
    max_bot_tags,
    bot_tags,
    max_summary_length,
    min_description_length,
    max_description_length
}, web: { recaptcha_v2: { site_key, secret_key } } } = require("@root/config.json");

const recaptcha = new recaptcha2({
    siteKey: site_key,
    secretKey: secret_key
})

function isValidUrl(string) {
    try { new URL(string); } 
    catch (_) { return false; }
    return true;
}

module.exports = async (req, b = null) => {
    let data = req.body;

    // User hasn't submitted a captcha
    if (!data.recaptcha_token)
        return { success: false, message: "Captcha inválida" }

    // Validate captcha
    try {
        await recaptcha.validate(data.recaptcha_token)
    } catch (e) {
        return { success: false, message: "Captcha inválida" }
    }

    // Check that all the fields are filled in
    if (!data.long.length || !data.description.length || !data.prefix.length)
        return { success: false, message: "Envío no válido. Comprueba que llenaste todos los campos." }
    
    // Max length for summary and note
    if (data.description.length > max_summary_length) return { success: false, message: "Tu resumen es demasiado largo." };
    if (String(data.note).length > max_summary_length) return { success: false, message: "Tu nota es demasiado larga." };

    // Check if summary or note has HTML.
    if (is(data.description))
        return { success: false, message: "HTML no es compatible con el resumen de su bot" }
    if (is(data.note))
        return { success: false, message: "HTML no es compatible con su nota" }

    // Check that the bot's HTML description isn't too long
    let stripped = data.long.replace("/<[^>]*>/g")
    if (stripped.length < min_description_length)
        return { success: false, message: "Tu descripción HTML es demasiado corta" }
    if (stripped.length > max_description_length)
        return { success: false, message: "Tu descripción HTML es demasiado larga" }
    
    // Check that all the links are valid
    if (data.invite && !isValidUrl(data.invite)) 
        return { success: false, message: "Enlace de invitación no válido" }
    if (data.support && !isValidUrl(data.support)) 
        return { success: false, message: "Servidor de soporte no válido" }
    if (data.website && !isValidUrl(data.website))
        return { success: false, message: "Sitio web inválido" }
    if (data.github && !isValidUrl(data.github))
        return { success: false, message: "Repositorio de Github no válido" }
    if (data.webhook && !isValidUrl(data.webhook))
        return { success: false, message: "URL de webhook no válida" }

    // Check bot tags are valid
    if (data.tags) {
        if (!Array.isArray(data.tags))
            return { success: false, message: "Tags de bot no válidos" }
        if (data.tags.length > max_bot_tags)
            return { success: false, message: `Seleccionar hasta ${max_bot_tags} tags maximo` }
        if (!data.tags.every(val => bot_tags.includes(val)))
            return { success: false, message: `Tag(s) no válidas` }
    }
    
    // Check the user is in the main server.
    try {
        await req.app.get('client').guilds.cache.get(id).members.fetch(req.user.id);
    } catch (e) {
        return { success: false, message: "No estas en el servidor", button: { text: "Unirse", url: "/join" } }

    }
    // Search for a user with discord
    let bot;
    try {
        bot = await req.app.get('client').users.fetch(req.params.id)
        if (!bot.bot)
            return { success: false, message: "ID invalida. El usuario no es un bot" }
    } catch (e) {
        // Invalid bot ID
        if (e.message.endsWith("is not snowflake.") || e.message == "Unknown User")
            return { success: false, message: "ID de bot no válido" }
        else
            return { success: false, message: "No se pudo encontrar el usuario" }
    }

    /* 
        Check that the user signed is either:
        - The primary owner
        - An additional owner
        - A server admin
    */
    if (
        b &&
        b.owners.primary !== req.user.id &&
        !b.owners.additional.includes(req.user.id) &&
        !req.user.staff
    )
        return { success: false, message: "Solicitud no válida. Inicia sesión de nuevo..", button: { text: "Cerrar sesión", url: "/logout" } }

    // If the additional owners have been changed, check that the primary owner is editing it
    if (
        b &&
        data.owners.replace(',', '').split(' ').remove('').join() !== b.owners.additional.join() &&
        b.owners.primary !== req.user.id
    )
        return { success: false, message: "Solo el owner principal puede editar owners adicionales" };
  
    let users = []
    if (data.owners) 
        users = data.owners.replace(',', '').split(' ').remove('').filter(id => /[0-9]{16,20}/g.test(id))

    try {
        /* 
            Filter owners:
            - Is in the server
            - Is not a bot user
            - Is not duplicate
        */
        users = await req.app.get('client').guilds.cache.get(id).members.fetch({ user: users });
        users = [...new Set(users.map(x => { return x.user }).filter(user => !user.bot).map(u => u.id))];

        // Check if additional owners exceed max
        if (users.length > max_owners_count)
            return { success: false, message: `Solo puedes sumar hasta ${max_owners_count} owners adicionales` };

        return { success: true, bot, users }
    } catch (e) {
        return { success: false, message: "ID de owners no válidos" };
    }
}
