/**
 * External Dependencies
 */
const electron = require( 'electron' );
const BrowserWindow = electron.BrowserWindow;
const app = electron.app;
const path = require( 'path' );

// HACK(sendhilp, 9/6/2016): The reason for this strange importing is there seems to be a
// bug post Electron 1.1.1 in which attempting to access electron.screen
// outside of app.on('ready') results in an error about require being unable
// to find '../screen.js'. I'm not 100% certain of the cause but I think it's
// something to do with Electron's common/reset-search-paths.js. For now this
// is a temporary workaround that will enable us to utilize the latest version of
// electron.
let screen;
app.on( 'ready', () => {
	if ( process.platform === 'win32' ) {
		// required to display application notification settings in Windows
		app.setAppUserModelId( 'com.automattic.wordpress' );
	}
	screen = electron.screen;
} );

/**
 * Internal dependencies
 */
const Config = require( 'calypso/desktop/lib/config' );

/**
 * Module variables
 */
const windows = {
	about: {
		file: 'about.html',
		config: 'aboutWindow',
		handle: null,
	},
	preferences: {
		file: 'preferences.html',
		config: 'preferencesWindow',
		handle: null,
	},
	secret: {
		file: 'secret.html',
		config: 'secretWindow',
		handle: null,
	},
	wapuu: {
		file: 'wapuu.html',
		config: 'secretWindow',
		full: true,
		handle: null,
	},
};

function setDimensions( config ) {
	const full = screen.getPrimaryDisplay();

	if ( config.width === 'full' ) config.width = full.bounds.width;

	if ( config.height === 'full' ) config.height = full.bounds.height;

	return config;
}

async function openWindow( windowName ) {
	if ( windows[ windowName ] ) {
		const settings = windows[ windowName ];

		if ( settings.handle === null ) {
			let config = Config[ settings.config ];
			config = setDimensions( config );

			// nodeIntegration is necessary to support usage of `require` in preload and HTML scripts.
			// FIXME: Refactor preload to use contextBridge instead (contextIsolation: true, nodeIntegration: false).
			const webPreferences = Object.assign( {}, config.webPreferences, {
				contextIsolation: false,
				nodeIntegration: true,
				preload: path.resolve( __dirname, '..', '..', '..', '..', 'public_desktop', 'preload.js' ),
			} );
			config.webPreferences = webPreferences;

			windows[ windowName ].handle = new BrowserWindow( config );
			windows[ windowName ].handle.setMenuBarVisibility( false );
			await windows[ windowName ].handle.webContents.session.setProxy( {
				proxyRules: 'direct://',
			} );
			windows[ windowName ].handle.loadURL(
				Config.server_url + ':' + Config.server_port + '/desktop/' + settings.file
			);

			windows[ windowName ].handle.on( 'closed', function () {
				windows[ windowName ].handle = null;
			} );

			// TODO: add a check to disable navigation events only for drag & drop
			// https://github.com/Automattic/wp-desktop/pull/464#discussion_r198071749
			if ( config.wpDragAndDropDisabled ) {
				windows[ windowName ].handle.webContents.on( 'will-navigate', function ( event ) {
					event.preventDefault();
					return false;
				} );
			}
		} else {
			settings.handle.show();
		}
	}
}

module.exports = {
	openPreferences: function () {
		openWindow( 'preferences' );
	},
	openAbout: function () {
		openWindow( 'about' );
	},
	openSecret: function () {
		openWindow( 'secret' );
	},
	openWapuu: function () {
		openWindow( 'wapuu' );
	},
};
