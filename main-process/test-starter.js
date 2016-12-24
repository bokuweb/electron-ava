'use strict';
const {app, ipcMain} = require('electron');
const createWindow = require('./create-window');

function initializeRenderer(opts) {
	const window = createWindow(opts.windowOptions, process.argv);

	ipcMain.on('ava-message', (event, name, data) => {
		sendAvaMessage(name, data);
	});

	process.on('message', message => {
		if (!message.ava) {
			return;
		}

		resendAvaMessageTo(window, message);
	});

	window.webContents.once('did-finish-load', () => {
		startRendererTests(window);
	});
}

function sendAvaMessage(name, data) {
	process.send({
		name: `ava-${name}`,
		data,
		ava: true
	});
}

function resendAvaMessageTo(window, message) {
	window.webContents.send('ava-message', message.name, message.data);
}

function startRendererTests(window) {
	window.webContents.send('test-start');
}

function startMainTests() {
	require('ava/lib/test-worker'); // eslint-disable-line import/no-unassigned-import
}

app.on('ready', () => {
	const opts = JSON.parse(process.argv[2]);
	if (opts.renderer) {
		initializeRenderer(opts);
	} else {
		startMainTests();
	}
});
