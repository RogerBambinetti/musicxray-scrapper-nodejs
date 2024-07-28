const axios = require('axios');
const jsdom = require("jsdom");
const https = require('https');
const fs = require('fs');

// At request level
const agent = new https.Agent({
    rejectUnauthorized: false
});

let currentID = 1247017;
const tracks = [];

async function init() {
    do {
        const response = await axios.get(`https://www.musicxray.com/xrays/${currentID}`, { httpsAgent: agent });

        if (response.status === 200) {
            try {

                const doc = new jsdom.JSDOM(response.data)
                const metadata = doc.window.document.querySelectorAll('.metadata');

                const trackInfo = {
                    ID: currentID,
                    artist: metadata.item(1).innerHTML,
                    album: metadata.item(2).innerHTML,
                    title: metadata.item(3).innerHTML
                }

                tracks.push(trackInfo);

                await fs.writeFileSync('./logs/logs.json', JSON.stringify(tracks, null, 4), 'utf8');

            } catch (e) {

            }
        }

        currentID++;
    } while (true);
}

init();