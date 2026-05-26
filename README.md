# ⚙️ MultiNode Tool

**MultiNode Tool** is a lightweight, simple local tool that provides a graphical interface to monitor, install, and dynamically control the versions of major tools in the web and mobile development ecosystem.

It allows you to visually manage your system's global versions from a single dashboard, executing terminal commands in the background.

## 🛠️ Supported Tools
The dashboard interacts directly with:
* **Node.js (via NVM)**
* **Angular CLI**
* **Ionic CLI**
* **Capacitor CLI**
* **TypeScript**
* **Yarn**
* **Firebase CLI**
* **Nodemon**
* **PM2**
* **Serve**
* **ts-node**
* **pnpm**

![](https://etb-apps.com/mnt/1.png)

## ⚠️ Prerequisites
For **MultiNode Tool** to properly operate and manage your environment, it is **strictly required** to have the following installed on your system:
1. **[Node.js](https://nodejs.org/)** (Any version to start the base server).
2. **[NVM (Node Version Manager)](https://github.com/nvm-sh/nvm)** (Or its equivalent [nvm-windows](https://github.com/coreybutler/nvm-windows) on Microsoft systems). The tool relies on NVM to perform dynamic Node version switching.

## 🚀 Quick Start (Non-persistent installation)
If you want to quickly test or use the tool without cloning or keeping the repository in your working folders, you can run it directly from your system's temporary directories.

Once you close the console, the tool will stop running and temporary files will be cleaned up according to your operating system's policy.

### 🐧 Linux / 🍏 macOS (Terminal / Bash)
Copy and paste the following line into your terminal. This will download the project, extract it into `/tmp`, install dependencies, and launch the interface:

```bash
curl -L "https://github.com/eltitobarte/MultiNode-Tool/archive/refs/heads/main.zip" -o /tmp/multinode.zip && unzip -q -o /tmp/multinode.zip -d /tmp && cd /tmp/multinode-tool-main && npm install && node app.js
```

### 🪟 Windows (PowerShell)
Copy and paste the following line into PowerShell. It will do exactly the same using your %TEMP% folder:

```powershell
Invoke-WebRequest -Uri "https://github.com/eltitobarte/MultiNode-Tool/archive/refs/heads/main.zip" -OutFile "$env:TEMP\multinode.zip"; Expand-Archive -Path "$env:TEMP\multinode.zip" -DestinationPath "$env:TEMP" -Force; Set-Location "$env:TEMP\multinode-tool-main"; npm install; node app.js
```
Once executed, open your web browser and go to http://localhost:3000.

### 💻 Manual Installation (Persistent)
If you prefer to keep the project on your machine for recurring use:

1. Clone the repository:
    ```bash
    git clone https://github.com/eltitobarte/MultiNode-Tool.git
    ```
2. Navigate to the directory:
    ```bash
	cd multinode-tool
	```
3. Install dependencies:
    ```bash
	npm install
	```
4. Start the application:
    ```bash
	node app.js
	```

### 🌍 Internationalization (i18n)
The tool features a native multi-language engine. It currently supports:

* 🇬🇧 English (Default)
* 🇪🇸 Spanish
* 🇩🇪 German
* 🇵🇱 Polish
* 🇷🇺 Russian

The language is automatically detected based on the host operating system, but can be changed in real-time from the interface header.

|||
|---|---|
|![](https://etb-apps.com/mnt/3.png)|![](https://etb-apps.com/mnt/2.png)|


### 📄 License
This project is distributed under the GNU General Public License v3.0 (GPL-3.0). You are free to use, modify, and distribute this software, provided that any derivative work is also distributed under the same terms of this license.

Developed by Bartosz Karallus
🌐 etb-apps.com | ✉️ info@etb-apps.com