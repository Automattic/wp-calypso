const { app } = require( 'electron' );
const Config = require( '../../lib/config' );

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
		// The commandLine is an array of strings in which the last element is the url.
		handleUrl( view, commandLine.pop() );
	} );
};

function handleUrl( view, url ) {
	if ( ! url ) {
		return;
	}
	const u = new URL( url );

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
