'use strict';

const { app } = require('electron');
const serializeError = require('ava/lib/serialize-error');
const messages = require('./messages');
const initializeRenderer = require('./initialize-renderer');

function onUncaughtException(err) {
	console.error(err)
	messages.sendToProcess('uncaughtException', {
		exception: serializeError(err)
	});
}

process.on('uncaughtException', onUncaughtException);

function startMainTests() {
	require('ava/lib/test-worker'); // eslint-disable-line import/no-unassigned-import
}

app.on('ready', () => {
	const opts = JSON.parse(process.argv[2]);
	if (opts.renderer) {
		initializeRenderer(opts);
	} else {
		startMainTests();
		// Disable duplicate reporting
		process.removeListener('uncaughtException', onUncaughtException);
	}
});
