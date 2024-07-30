const axios = require('axios');
const jsdom = require("jsdom");
const https = require('https');
const fs = require('fs');

// At request level
const agent = new https.Agent({
    rejectUnauthorized: false
});

let tracks = [];

const sitemap = require('./sitemaps/sitemap1.json');

async function request(url) {
    const response = await axios.get(url, { httpsAgent: agent });

    if (response.status === 200) {
        try {

            const doc = new jsdom.JSDOM(response.data)
            const metadata = doc.window.document.querySelectorAll('.metadata');

            const trackInfo = {
                url: url,
                artist: metadata.item(1)?.innerHTML,
                album: metadata.item(2)?.innerHTML,
                title: metadata.item(3)?.innerHTML,
                extra: doc.window.document.querySelector('.box.grey-outline')?.innerHTML
            }

            return trackInfo;
        } catch (e) {
            console.log(e);
        }
    }
}

async function init() {
    for (const url of sitemap) {

        const result = await request(url);
        tracks.push(result);

        await fs.writeFileSync(`./logs/logs-sitemap1.json`, JSON.stringify(tracks, null, 4), 'utf8');
    }
}

init();