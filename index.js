const axios = require('axios');
const jsdom = require("jsdom");
const https = require('https');
const fs = require('fs');

// At request level
const agent = new https.Agent({
    rejectUnauthorized: false
});

let tracks = [];

const args = process.argv[2];
let sitemap = require(`./sitemaps/${args}.json`);

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

    if (fs.existsSync(`./logs/logs-${args}.json`)) {
        const existingLog = require(`./logs/logs-${args}.json`);
        const lastLog = existingLog[existingLog.length - 1];

        tracks = existingLog;
        sitemap = sitemap.slice(sitemap.indexOf(lastLog.url) + 1);
    }

    for (const [index, value] of sitemap.entries()) {

        console.log(`Adding ${index + 1} of ${sitemap.length}`);

        const result = await request(value);
        tracks.push(result);

        await fs.writeFileSync(`./logs/logs-${args}.json`, JSON.stringify(tracks, null, 4), 'utf8');
    }
}

init();