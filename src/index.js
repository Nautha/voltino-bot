const Telegraf = require('telegraf');
const fs = require('fs');
// const {Scrapper} = require('./Scrapper');
const scraper = require('table-scraper');

const app = new Telegraf(process.env.BOT_TOKEN);
// const scrapper = new Scrapper();


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

app.command('send', ctx => {
    console.log('send', ctx.chat);
    sendPlan();
    app.telegram.sendMessage(ctx.chat.id, 'requested');
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
            const menu = formatPlan(body[0]);

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

function sendToAll() {

}

function sendToUser() {

}

function formatPlan(body) {

    console.log(body[0]);

    let content = '';

    let counter = 0;

    Object.keys(body[0]).map(function (objectKey, index) {
        let value = body[0][objectKey];

        let price = objectKey.split('_')[0];

        let item = value;

        item = item.split(',')[0];  //removes the additives from string end except for the first one

        let itemArray = item.split(' ');
        item = '';
        for(let i = 1; i < itemArray.length; i++) {
            item += itemArray[i - 1] + ' ';
        }

        content += `${price} ${item} \n`;

        counter++;

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