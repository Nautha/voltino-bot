const scraper = require('table-scraper');


const url = 'https://www.voltino.hn/voltino/wochenkarte';

class Scrapper {

    scrap() {
        return scraper
            .get(url)
            .then(function (tableData) {
                // console.log(tableData);
                console.log('table loaded');
                return tableData;
            })
    }

}

module.exports = {Scrapper};


// function buildJson(table) {
//     let json = {
//         "Montag": {
//
//         },
//         "Dienstag": {
//
//         },
//         "Mittwoch": {
//
//         },
//         "Donnerstag": {
//
//         },
//         "Freitag": {
//
//         }
//     }
//
//
//
// }