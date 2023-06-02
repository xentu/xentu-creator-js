import { app, BrowserWindow, Menu, ipcMain } from 'electron';
import AppEventBridge from '../classes/AppEventBridge';
import XentuCreatorMenu from './menu';
const path = require( 'path' );
const fs = require( 'fs-extra' );

// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
	app.quit();
}


class XentuCreatorApp {
	mainMenu: XentuCreatorMenu;
	eventsForMainWindow: AppEventBridge;
	eventsForActiveTab: AppEventBridge;
	t: number = 55;


	constructor() {
		// setup variables.
		this.eventsForMainWindow = new AppEventBridge();
		this.eventsForActiveTab = new AppEventBridge();
		this.mainMenu = new XentuCreatorMenu(this);

		// hook window events.
		app.on('ready', this.createWindow);
		app.on('window-all-closed', async () => {
			if (process.platform !== 'darwin') {
				app.quit();
			}
		});
		app.on('activate', () => {
			if (BrowserWindow.getAllWindows().length === 0) {
				this.createWindow();
			}
		});

		// setup the api.
		ipcMain.on('set-title', this.handleSetTitle);
		ipcMain.handle('list-files', this.handleListFiles);
		ipcMain.handle('open-file', this.handleOpenFile);
		ipcMain.handle('save-file', this.handleSaveFile);
	}


	// #########################################################################
	// Functions
	// #########################################################################


	/**
	 * Creates a new electron window.
	 */
	createWindow(): void {
		// Create the browser window.
		const mainWindow = new BrowserWindow({
			height: 600,
			width: 1024,
			icon: path.join(__dirname, '/../renderer/images/xentu-icon.ico'),
			webPreferences: {
				preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
			},
		});
	
		// and load the index.html of the app.
		mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
		//setMenuDisabled(true);
		//mainWindow.webContents.openDevTools();
	}


	// #########################################################################
	// API event handlers.
	// #########################################################################


	handleSetTitle(event:any, title:string): void {
		const webContents = event.sender;
		const win = BrowserWindow.fromWebContents(webContents);
		win.setTitle(title);
	}


	handleListFiles(event:any, scanPath: string): void {
		const files = fs.readdirSync( scanPath );
		return files.map( (filename:String) => {
			  const filePath = path.resolve( scanPath, filename );
			  const fileStats = fs.statSync( filePath );
			  const isDirectory = fileStats.isDirectory();
			  return {
					name: filename,
					path: filePath,
					directory: isDirectory,
					ext: isDirectory ? 'folder' : filename.split('.').pop(),
					size: Number( fileStats.size / 1000 ).toFixed( 1 ), // kb
			  };
		});
	}

	async handleOpenFile(event:any, filePath: string) {
		const theData = await fs.readFile(filePath, 'utf-8');
		const ext = filePath.split('.').pop();
		let lang = 'text';
	
		switch (ext) {
			case 'js': lang = 'javascript'; break;
			case 'json': lang = 'text'; break;
			case 'toml': lang = 'toml'; break;
			case 'lua': lang = 'lua'; break;
			case 'py': lang = 'python'; break;
			case 'xml': lang = 'xml'; break;
		}
	
		return JSON.stringify({
			label: path.basename(filePath),
			lang: lang,
			path: filePath,
			data: theData
		});
	}

	async handleSaveFile(event:any, filePath: string, data:string) {
		try {
			await fs.outputFile(filePath, data, 'utf-8');
			return JSON.stringify({	success: true,	message: 'Saved!'	});
		}
		catch (err) {
			return JSON.stringify({ success: false, message: err });
	 	}
	}
}


new XentuCreatorApp();