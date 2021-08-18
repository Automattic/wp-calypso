const { ipcRenderer, contextBridge } = require( 'electron' );

// Outgoing IPC message channels from Renderer to Main process.
// Maintain this list in alphabetical order.
const sendChannels = [
	'get-config',
	'get-settings',
	'log',
	'request-site-response',
	'clear-notices-count',
	'back-button-clicked',
	'forward-button-clicked',
	'home-button-clicked',
	'user-auth',
	'user-login-status',
	'view-post-clicked',
	'print',
	'secrets',
	'toggle-dev-tools',
	'title-bar-double-click',
	'magic-link-set-password',
];

// Incoming IPC message channels from Main process to Renderer.
// Maintain this list in alphabetical order.
const receiveChannels = [
	'app-config',
	'cookie-auth-complete',
	'is-calypso',
	'is-calypso-response',
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

function fflagOverrides() {
	const payload = {};
	const fflags = process.env.WP_DESKTOP_DEBUG_FEATURES
		? process.env.WP_DESKTOP_DEBUG_FEATURES.split( ',' )
		: [];
	for ( let i = 0; i < fflags.length; i++ ) {
		const kv = fflags[ i ].split( ':' );
		payload[ kv[ 0 ] ] = kv[ 1 ] === 'true' ? true : false;
	}

	// Manual override of feature flags for features not available in older app versions
	payload[ 'sign-in-with-apple' ] = true;
	payload[ 'signup/social' ] = true;
	return payload;
}

( async () => {
	const config = await ipcRenderer.invoke( 'get-config' );
	const styles = {
		titleBarPaddingLeft: process.platform !== 'darwin' ? '0px' : '77px',
	};
	const features = fflagOverrides();
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
		styles,
		features,
	} );
} )();
