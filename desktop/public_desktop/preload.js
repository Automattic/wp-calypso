const { ipcRenderer, contextBridge } = require( 'electron' );

// Outgoing IPC message channels from Renderer to Main process.
// Maintain this list in alphabetical order.
const sendChannels = [
	'cannot-use-editor',
	'get-config',
	'get-settings',
	'log',
	'request-site-response',
	'unread-notices-count',
	'user-auth',
	'user-login-status',
];

// Incoming IPC message channels from Main process to Renderer.
// Maintain this list in alphabetical order.
const receiveChannels = [
	'cookie-auth-complete',
	'enable-notification-badge',
	'enable-site-option',
	'navigate',
	'new-post',
	'notification-clicked',
	'notifications-panel-refresh',
	'notifications-panel-show',
	'page-help',
	'page-my-sites',
	'page-profile',
	'page-reader',
	'request-site',
	'request-user-login-status',
	'signout',
	'toggle-notification-bar',
];

( async () => {
	const config = await ipcRenderer.invoke( 'get-config' );
	contextBridge.exposeInMainWorld( 'electron', {
		send: ( channel, ...args ) => {
			if ( sendChannels.includes( channel ) ) {
				ipcRenderer.send( channel, ...args );
			}
		},
		receive: ( channel, callback ) => {
			if ( receiveChannels.includes( channel ) ) {
				// exclude event with sender info
				ipcRenderer.on( channel, ( _, ...args ) => callback( ...args ) );
			}
		},
		logger: ( namespace, options ) => {
			const send = ( level, message, meta ) => {
				ipcRenderer.send( 'log', level, namespace, options, message, meta );
			};

			return {
				error: ( message, meta ) => send( 'error', message, meta ),
				warn: ( message, meta ) => send( 'warn', message, meta ),
				info: ( message, meta ) => send( 'info', message, meta ),
				debug: ( message, meta ) => send( 'debug', message, meta ),
				silly: ( message, meta ) => send( 'silly', message, meta ),
			};
		},
		config,
	} );
} )();
