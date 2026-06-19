const { app } = require( 'electron' );
const Config = require( '../../lib/config' );
const log = require( '../../lib/logger' )( 'desktop:incoming-urls' );

module.exports = function ( { view, mainWindow } ) {
	// Mac.
	app.on( 'open-url', ( event, url ) => handleUrl( view, url ) );

	// Windows and Linux. For more information see:
	// https://www.electronjs.org/docs/latest/tutorial/launch-app-from-url-in-another-app#windows-and-linux-code
	app.on( 'second-instance', ( event, commandLine ) => {
		if ( mainWindow ) {
			if ( mainWindow.isMinimized() ) {
				mainWindow.restore();
			}
			mainWindow.focus();
		}
		// A second launch is not necessarily a deep link: a plain relaunch passes argv such
		// as the executable path or CLI flags, none of which are URLs. Only forward an
		// argument that actually looks like one of our protocol URLs.
		handleUrl( view, findProtocolUrl( commandLine ) );
	} );
};

function findProtocolUrl( args ) {
	if ( ! Array.isArray( args ) ) {
		return undefined;
	}
	const prefix = `${ Config.protocol }://`.toLowerCase();
	return args.find( ( arg ) => typeof arg === 'string' && arg.toLowerCase().startsWith( prefix ) );
}

function handleUrl( view, url ) {
	if ( ! url ) {
		return;
	}

	let u;
	try {
		u = new URL( url );
	} catch ( error ) {
		// Guard against malformed input reaching the WHATWG URL parser, which throws
		// `TypeError: Invalid URL` and would otherwise crash the main process. (DOTAPP-8)
		log.info( `Ignoring unparseable incoming URL "${ url }": ${ error.message }` );
		return;
	}

	// It should not be possible that the protocol is not Config.protocol, but you never know.
	if ( u.protocol !== `${ Config.protocol }:` ) {
		return;
	}

	// We only care about login URLs, all other URLs are ignored for now.
	// We're comparing with `u.host` here because the URL has the form wpdesktop://token#*,
	// so `auth` is actually the host, not the pathname.
	if ( u.host !== 'token' ) {
		return;
	}

	// If the hash is not present, something must have gone wrong, so we redirect back to the login page.
	if ( ! u.hash ) {
		void view.webContents.loadURL( Config.loginURL() );
		return;
	}

	void view.webContents.loadURL( Config.loginURL() + `/finalize${ u.hash }` );
}
