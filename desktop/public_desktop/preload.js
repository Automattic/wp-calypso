const { ipcRenderer, remote } = require( 'electron' );

const logger = ( namespace, options ) => {
	// FIXME: The `remote` module is being deprecated and will be excluded
	// from Electron v9.x.

	// It is possible to use the `remote` module to directly require the
	// main process logging module. However, this is a security concern and is
	// discouraged. Instead, we post log messages to the main process via ipc.
	const send = ( level, message, meta ) => {
		ipcRenderer.send( 'log', level, namespace, options, message, meta );
	};

	return {
		error: ( message, meta ) => send( 'error', namespace, options, message, meta ),
		warn: ( message, meta ) => send( 'warn', namespace, options, message, meta ),
		info: ( message, meta ) => send( 'info', namespace, options, message, meta ),
		debug: ( message, meta ) => send( 'debug', namespace, options, message, meta ),
		silly: ( message, meta ) => send( 'silly', namespace, options, message, meta ),
	};
};
window.logger = logger; // expose logger interface to other renderer processes

const desktop = remote.getGlobal( 'desktop' );

// WARNING WARNING WARNING
// This is exposed to the web renderer. Be careful about putting stuff in here as client JS will have access to it
// WARNING WARNING WARNING

// TODO: Either merge this with the `desktop` object or find a way to completely get rid of this
window.electron = {
	ipcRenderer,
	getCurrentWindow: remote.getCurrentWindow,
	getBuild: () => desktop.config.build,
	isDebug: () => desktop.settings.isDebug(),
};
