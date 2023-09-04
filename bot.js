const p = require("puppeteer-extra");
const path = require('path')

const spoof = path.join(process.cwd(), "extension/spoof/");

let browser;
let page;
let stopFlag;

const runaAway = async (logToTextarea, headless) => {
    const options = {
        // executablePath: path.join(process.cwd(), "chrome/chrome.exe"),
        ignoreHTTPSErrors: true,
        args: [
            `--load-extension=${spoof}`,
            `--disable-extensions-except=${spoof}`,
            "--disable-dev-shm-usage",
            "--no-sandbox",
            "--disable-popup-blocking",
            "--allow-popups-during-page-unload",
            "--disable-setuid-sandbox",
            "--force-device-scale-factor=0.5"
        ]
    }

    browser = await p.launch({
        defaultViewport: null,
        headless: headless,
        ...options,
    })
    const context = browser.defaultBrowserContext();
    context.overridePermissions('https://whoer.net/', ["geolocation", "notifications"]);

    page = await browser.newPage()

    page.sleep = function (timeout) {
        return new Promise(function (resolve) {
            setTimeout(resolve, timeout);
        });
    };

    try {
        logToTextarea("Navigating")
        await page.goto('https://whoer.net/', {
            waitUntil: 'networkidle2',
            timeout: 60000
        })

        await page.waitForSelector('[class="card__col card__col_value matched highlighted_red"]');
        const zones = await page.$$('[class="card__col card__col_value matched highlighted_red"]');

        if (zones.length > 0) {
            const arrayZone = [zones[0], zones[1], zones[2]];

            const zone = await page.evaluate(e => e.textContent, arrayZone[0]);
            const lokal = await page.evaluate(e => e.textContent, arrayZone[1]);
            const system = await page.evaluate(e => e.textContent, arrayZone[2]);

            const filterEmptyLines = (text) => {
                return text
                    .split('\n')
                    .filter(line => line.trim() !== '')
                    .join('\n');
            };

            const filteredZone = filterEmptyLines(zone);
            const filteredLokal = filterEmptyLines(lokal);
            const filteredSystem = filterEmptyLines(system);

            logToTextarea("Zone : " + filteredZone);
            logToTextarea("Local : " + filteredLokal);
            logToTextarea("System : " + filteredSystem + '\n');
        }

        await page.waitForTimeout(1000)
        await browser.close()
    } catch (error) {
        logToTextarea(error)
    }
}

const startProccess = async (logToTextarea, headless) => {
    for (let i = 0; i < 5; i++) {
        try {
            stopFlag = false;
            logToTextarea("Anu : " + i)
            await runaAway(logToTextarea, headless)

        } catch (error) {
            logToTextarea(error)
        } finally {
            await browser.close()
        }

        if (stopFlag) {
            logToTextarea("Stop the proccess success")
            break
        }
    }
}

const stopProccess = (logToTextarea) => {
    stopFlag = true;
    logToTextarea("Stop Proccess, waiting until this proccess done")
}

module.exports = {
    startProccess,
    stopProccess
}