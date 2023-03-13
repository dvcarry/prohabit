const { Bot, session } = require("grammy");
const bot = new Bot(process.env.BOTTOKEN);
const telegramService = require("../services/telegramService");

bot.use(session({ initial: () => ({ step: '' }) }));

bot.command("start", (ctx) => ctx.reply("Привет, путник! Нажми /registration чтобы привязать бота."));
bot.command("registration", (ctx) => {
    ctx.session.step = 'registration'
    ctx.reply("Введи свою почту, указанную при регистрации")
});
bot.on("message", async (ctx) => {
    if (ctx.session.step === 'registration') {
        const response = await telegramService.addTelegram(ctx.message.text, ctx.chat.id)
        if (response.status === 'SUCCESS') {
            ctx.session.step = ''
            ctx.reply("Успешно!")
        } else {
            ctx.reply("Нет такой почты")
        }
    } else {
        ctx.reply("Не знаю, что ты хочешь(")
    }
});

bot.start();

const sendMessage = async (telegram_id, message) => {
    await bot.api.sendMessage(telegram_id, message);
}

module.exports = { sendMessage };


