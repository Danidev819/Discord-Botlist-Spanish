const Bots = require("@models/bots");

const { web: { ratelimit } } = require("@root/config.json");

module.exports = async(req, res, next) => {
    let auth = req.headers.authorization;
    if (!auth) return res.json({ success: "false", error: "No se encontró el encabezado de autorización." });

    const bot = await Bots.findOne({ botid: req.params.id }, { _id: false })
    if (!bot) return res.json({ "success": "false", "error": "Bot no encontrado." });

    if (!bot.auth) return res.json({ success: "false", error: "Crea un token de autorización de bot." });
    if (bot.auth !== auth) return res.json({ success: "false", error: "Token de autorización incorrecto." });

    if (bot.ratelimit && Date.now() - bot.ratelimit < (ratelimit * 1000)) return res.json({ success: "false", error: "Estas siendo limitado." });

    Bots.updateOne({ botid: req.params.id }, { ratelimit: Date.now() })
    return next();
}
