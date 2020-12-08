const { ipcRenderer, contextBridge } = require( 'electron' );

// Outgoing IPC message channels from Renderer to Main process.
// Maintain this list in alphabetical order.
const sendChannels = [
	'cannot-use-editor',
	'enable-site-option-response',
	'get-config',
	'get-settings',
	'log',
	'request-site-response',
	'unread-notices-count',
	'user-auth',
	'user-login-status',
	'view-post-clicked',
	'print',
	'secrets',
	'toggle-dev-tools',
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
		receive: ( channel, onReceived ) => {
			if ( receiveChannels.includes( channel ) ) {
				// exclude event with sender info
				const callback = ( _, ...args ) => onReceived( ...args );
				ipcRenderer.on( channel, callback );
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
