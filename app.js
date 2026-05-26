/**
 * MultiNode Tool v1.0.0
 * * Copyright (C) 2026 Bartosz Karallus
 * Contact: info@etb-apps.com | https://etb-apps.com
 * * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const isWin = process.platform === 'win32';

// Detects the operating system language (e.g., ‘es-ES’, ‘en-US’) and extracts the prefix
const osLocale = Intl.DateTimeFormat().resolvedOptions().locale || 'en';
let defaultLang = osLocale.split('-')[0];

app.use(express.json());

// Serve the translations folder as a static file
app.use('/locales', express.static(path.join(__dirname, 'locales')));

// Backend translation function (reads JSON dynamically)
const tBack = (key, params = {}, lang = null) => {
	const currentLang = lang || defaultLang;

    try {
        const filePath = path.join(__dirname, `locales/${currentLang}.json`);
        if (!fs.existsSync(filePath)) return key;

        const translations = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        let template = key.split('.').reduce((obj, k) => (obj || {})[k], translations) || key;

        // Make sure we find a string before attempting to replace it
        if (typeof template === 'string') {
            return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, paramName) => {
                return params[paramName] !== undefined ? params[paramName] : match;
            });
        }

        return template;
    } catch (e) {
        return key;
    }
};

const runCommand = (cmd) => {
    return new Promise((resolve) => {
        const shellCmd = isWin ? cmd : `. ~/.nvm/nvm.sh && ${cmd}`;
        exec(shellCmd, { shell: isWin ? 'cmd.exe' : '/bin/bash' }, (error, stdout, stderr) => {
            const output = (stdout || '').trim();
            const errOutput = (stderr || '').trim();

            if (error && !output) {
                resolve({ success: false, message: errOutput || error.message });
            } else {
                resolve({ success: true, message: output });
            }
        });
    });
};

const getAvailableLanguages = async () => {
	const localesPath = path.join(__dirname, 'locales');
    const files = await fs.promises.readdir(localesPath);
    const languages = [];

    for (const file of files) {
        if (file.endsWith('.json')) {
            const code = path.basename(file, '.json');
            const fileContent = await fs.promises.readFile(path.join(localesPath, file), 'utf-8');

            try {
                const jsonData = JSON.parse(fileContent);
                if (jsonData.LANGUAGE) {
                    languages.push({ code: code, name: jsonData.LANGUAGE });
                }
            } catch (e) {
                // Ignore malformed JSON
            }
        }
    }
    return languages;
};

// Serve the separate HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/info/languages', async (req, res) => {
	try {
        const languages = await getAvailableLanguages();
        res.json(languages);
    } catch (error) {
        res.status(500).json({ message: tBack('SERVER.ERROR.DIR_LANGUAGES') });
    }
});

app.post('/api/lang/switch', async (req, res) => {
	const { lang } = req.body;

    if (!lang) {
        // We use tBack in case you want the error message to be translated into the current language
        return res.status(400).json({ message: tBack('SERVER.LANG_NOT_PROVIDED', {}, defaultLang), success: false });
    }

    try {
        const languages = await getAvailableLanguages();
        const exists = languages.some(l => l.code === lang);

        if (exists) {
            defaultLang = lang; // Update the server's global variable
            res.json({ message: tBack('SERVER.LANG_CHANGED', { lang: lang.toUpperCase() }, defaultLang), success: true });
        } else {
            res.status(404).json({ message: tBack('SERVER.LANG_NOT_FOUND', { lang: lang.toUpperCase() }, defaultLang), success: false });
        }
    } catch (error) {
        res.status(500).json({ message: tBack('SERVER.ERROR.INTERNAL_LANG_ERROR', {}, defaultLang), success: false });
    }
});

app.get('/api/info/node', async (req, res) => {
    const currentRes = await runCommand('node -v');
    const current = currentRes.success && currentRes.message ? currentRes.message.replace('v', '').trim() : tBack('SERVER.UNKNOWN');

    const listCmd = isWin ? 'nvm list' : 'nvm ls --no-colors';
    const listRes = await runCommand(listCmd);

    const installed = [];
    if (listRes.message) {
        const matches = listRes.message.match(/\d+\.\d+\.\d+/g);
        if (matches) {
            installed.push(...new Set(matches));
        }
    }

    res.json({ current, installed: installed.sort((a,b) => b.localeCompare(a, undefined, {numeric: true})) });
});

app.get('/api/info/angular', async (req, res) => {
    const angRes = await runCommand('npm list -g @angular/cli --depth=0');
    const match = angRes.message.match(/@angular\/cli@(\d+\.\d+\.\d+)/);
    res.json({ current: match ? match[1] : null });
});

app.get('/api/info/ionic', async (req, res) => {
    const ionicRes = await runCommand('npm list -g @ionic/cli --depth=0');
    const match = ionicRes.message.match(/@ionic\/cli@(\d+\.\d+\.\d+)/);
    res.json({ current: match ? match[1] : null });
});

app.get('/api/info/capacitor', async (req, res) => {
    const capRes = await runCommand('npm list -g @capacitor/cli --depth=0');
    const match = capRes.message.match(/@capacitor\/cli@(\d+\.\d+\.\d+)/);
    res.json({ current: match ? match[1] : null });
});

app.get('/api/info/typescript', async (req, res) => {
    const tsRes = await runCommand('npm list -g typescript --depth=0');
    const match = tsRes.message.match(/typescript@(\d+\.\d+\.\d+)/);
    res.json({ current: match ? match[1] : null });
});

app.get('/api/info/yarn', async (req, res) => {
    const yarnRes = await runCommand('npm list -g yarn --depth=0');
    const match = yarnRes.message.match(/yarn@(\d+\.\d+\.\d+)/);
    res.json({ current: match ? match[1] : null });
});

app.get('/api/info/firebase', async (req, res) => {
    const fbRes = await runCommand('npm list -g firebase-tools --depth=0');
    const match = fbRes.message.match(/firebase-tools@(\d+\.\d+\.\d+)/);
    res.json({ current: match ? match[1] : null });
});

app.get('/api/info/nodemon', async (req, res) => {
    const nodemonRes = await runCommand('npm list -g nodemon --depth=0');
    const match = nodemonRes.message.match(/nodemon@(\d+\.\d+\.\d+)/);
    res.json({ current: match ? match[1] : null });
});

app.get('/api/info/pm2', async (req, res) => {
    const pm2Res = await runCommand('npm list -g pm2 --depth=0');
    const match = pm2Res.message.match(/pm2@(\d+\.\d+\.\d+)/);
    res.json({ current: match ? match[1] : null });
});

app.get('/api/info/serve', async (req, res) => {
    const serveRes = await runCommand('npm list -g serve --depth=0');
    const match = serveRes.message.match(/serve@(\d+\.\d+\.\d+)/);
    res.json({ current: match ? match[1] : null });
});

app.get('/api/info/tsnode', async (req, res) => {
    const tsNodeRes = await runCommand('npm list -g ts-node --depth=0');
    const match = tsNodeRes.message.match(/ts-node@(\d+\.\d+\.\d+)/);
    res.json({ current: match ? match[1] : null });
});

app.get('/api/info/pnpm', async (req, res) => {
    const pnpmRes = await runCommand('npm list -g pnpm --depth=0');
    const match = pnpmRes.message.match(/pnpm@(\d+\.\d+\.\d+)/);
    res.json({ current: match ? match[1] : null });
});

app.get('/api/available/:type', async (req, res) => {
    const { type } = req.params;
    let versions = [];

    if (type === 'node') {
        const cmd = isWin ? 'nvm list available' : 'nvm ls-remote --no-colors';
        const result = await runCommand(cmd);

        if (result.message) {
            const matches = result.message.match(/\d+\.\d+\.\d+/g) || [];
            versions = [...new Set(matches)].reverse().slice(0, 30);
        }
   } else if (['angular', 'ionic', 'capacitor', 'typescript', 'yarn', 'firebase', 'nodemon', 'pm2', 'serve', 'tsnode', 'pnpm'].includes(type)) {
        const pkg = type === 'angular' ? '@angular/cli' : type === 'ionic' ? '@ionic/cli' : type === 'capacitor' ? '@capacitor/cli' : type === 'typescript' ? 'typescript' : type === 'yarn' ? 'yarn' : type === 'firebase' ? 'firebase-tools' : type === 'nodemon' ? 'nodemon' : type === 'pm2' ? 'pm2' : type === 'serve' ? 'serve' : type === 'tsnode' ? 'ts-node' : 'pnpm';
        const result = await runCommand(`npm view ${pkg} versions --json`);
        if (result.success && result.message) {
            try {
                const allVersions = JSON.parse(result.message);
                versions = allVersions.filter(v => !v.includes('-')).reverse().slice(0, 30);
            } catch (e) {}
        }
    }
    res.json({ versions });
});

app.post('/api/switch', async (req, res) => {
    const { type, version, lang } = req.body;
    const currentLang = lang || 'es';

    if (!/^[0-9]+(\.[0-9]+)*$/.test(version)) {
        return res.status(400).json({ message: tBack('SERVER.INVALID_FORMAT') });
    }

    let command = "";
    if (type === 'node') {
        command = `nvm install ${version} && nvm use ${version}`;
    } else if (type === 'angular') {
        command = `npm install -g @angular/cli@${version}`;
    } else if (type === 'ionic') {
        command = `npm install -g @ionic/cli@${version}`;
    } else if (type === 'capacitor') {
        command = `npm install -g @capacitor/cli@${version}`;
    } else if (type === 'typescript') {
        command = `npm install -g typescript@${version}`;
    } else if (type === 'yarn') {
        command = `npm install -g yarn@${version}`;
    } else if (type === 'firebase') {
        command = `npm install -g firebase-tools@${version}`;
    } else if (type === 'nodemon') {
        command = `npm install -g nodemon@${version}`;
    } else if (type === 'pm2') {
        command = `npm install -g pm2@${version}`;
    } else if (type === 'serve') {
        command = `npm install -g serve@${version}`;
    } else if (type === 'tsnode') {
        command = `npm install -g ts-node@${version}`;
    } else if (type === 'pnpm') {
        command = `npm install -g pnpm@${version}`;
    } else {
        return res.status(400).json({ message: tBack('SERVER.INVALID_TYPE') });
    }

    const result = await runCommand(command);
    res.json(result);
});

app.listen(PORT, () => {
    console.log(tBack('SERVER.START', { port: PORT }));
    const start = (process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open');
    require('child_process').exec(`${start} http://localhost:${PORT}`);
});