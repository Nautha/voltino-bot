const Telegraf = require('telegraf');
const fs = require('fs');
const scraper = require('table-scraper');
const CronJob = require('cron').CronJob;

const app = new Telegraf(process.env.BOT_TOKEN);


app.telegram.getMe().then((botInfo) => {
    app.options.username = botInfo.username;
    console.log("Initialized", botInfo.username);
});

if (!fs.existsSync('users.json')) {
    fs.writeFileSync('users.json', '{}');
}
let users = JSON.parse(fs.readFileSync('users.json'));

app.command('start', ctx => {
    console.log('start', ctx.chat);
    users[ctx.chat.id] = ctx.chat;
    fs.writeFileSync('users.json', JSON.stringify(users));
    ctx.reply('Guten Tag. Ich werde dir jeden Tag das aktuelle Menü des Voltino Restaurants senden.')
});

app.command('stop', ctx => {
    console.log('stop', ctx.chat);
    delete users[ctx.chat.id];
    fs.writeFileSync('users.json', JSON.stringify(users));
    ctx.reply('Du bekommst nun keine täglichen Updates mehr. Um sie wieder zu abbonieren, schreibe /start');
});

app.startPolling();

function sendPlan() {
    const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    const date = new Date();
    const day = date.getDay();

    console.log('Requesting for', days[day], date);

    const result = scraper
        .get('https://www.voltino.hn/voltino/wochenkarte')
        .then((body) => {
            const menu = formatPlan(body[0], day - 1, date);

            for (let user in users) {
                if (!users.hasOwnProperty(user)) {
                    continue;
                }
                app.telegram.sendMessage(user, menu, {parse_mode: 'Markdown'});
            }
        })
        .catch((err) => {
            throw err;
        })
}

function formatPlan(body, day, date) {

    const daysFullName = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

    const dateString = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;

    let content = `Menü für ${daysFullName[day]} den ${dateString}\n\n`;

    let counter = 0;

    Object.keys(body[day]).map(function (objectKey, index) {
        let value = body[day][objectKey];

        let price = objectKey.split('_')[0];

        let item = value;

        if (counter !== 0) {
            content += `${price} ${item} \n`;
        }


        counter++;

        if (counter < 4) {
            content += '\n';
        }

        if (counter === 4) {
            content += "\nBeilagen:\n"
        }
        if (counter === 6) {
            content += "\nDessert:\n"
        }
    });

    console.log(content);
    return content;
}

new CronJob('00 00 11 * * 1-5', sendPlan).start();