require("module-alias/register");
const mongoose = require("mongoose");
const bot = require('@bot/index');
const App = require('@structures/app.js');
const { web: {port}, discord_client: {token}, mongo_url } = require("@root/config.json");


(async () => {
    await mongoose.connect(`${mongo_url}`, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    });
    console.log(`Conectado a la base de datos en`,`\x1b[34m\x1b[4m${mongo_url}\x1b[0m`);
    let client = await bot.init(token);
    console.log(`Conectado como ` + `\x1b[34m\x1b[4m${client.user.tag}\x1b[0m`);
    await new App(client).listen(port || 8080);
    console.log(`Corriendo en el puerto ` + `\x1b[34m\x1b[4m${port || 80}\x1b[0m`);
})()
