const { BrowserWindow } = require( 'electron' );
const assets = require( '../../lib/assets' );
const Config = require( '../../lib/config' );
const log = require( '../../lib/logger' )( 'desktop:external-links' );

let targetURL = '';

module.exports = function ( { view } ) {
	// TODO: Replace the "new-window" event with webcontents.setWindowOpenHandler
	// when Electron is updated to >= 13.x
	view.webContents.on(
		'new-window',
		function (
			event,
			url,
			frameName,
			disposition,
			options,
			additionalFeatures,
			referrer,
			postBody
		) {
			if ( url.includes( 'https://accounts.google.com' ) ) {
				event.preventDefault();
				const win = new BrowserWindow( {
					webContents: options.webContents, // use existing webContents if provided
					show: false,
				} );

				win.webContents.on( 'will-navigate', function ( e, u ) {
					log.info( 'Google Window will navigate: ' + u );
				} );

				win.webContents.on( 'will-redirect', function ( e, u ) {
					log.info( 'Google Window will redirect: ' + u );
				} );

				win.once( 'ready-to-show', () => win.show() );
				if ( ! options.webContents ) {
					const loadOptions = {
						httpReferrer: referrer,
					};
					if ( postBody != null ) {
						const { data, contentType, boundary } = postBody;
						loadOptions.postData = postBody.data;
						loadOptions.extraHeaders = `content-type: ${ contentType }; boundary=${ boundary }`;
					}

					win.loadURL( url, loadOptions ); // existing webContents will be navigated automatically
				}
				event.newGuest = win;
			} else {
				// Check if the incoming URL is blank and if it is send to the targetURL instead
				const urlToLoad = url.includes( 'about:blank' ) || url === '' ? targetURL : url;
				log.info( `Navigating to URL: '${ urlToLoad }'` );

				event.preventDefault();
				view.webContents.loadURL( urlToLoad );
				return;
			}
		}
	);

	// Magic links aren't supported in the app currently. Instead we'll show a message about how
	// to set a password on the account to log in that way.
	view.webContents.on( 'will-navigate', function ( event, url ) {
		log.info( 'Will navigate: ' + url );
		if ( url === Config.baseURL() + 'log-in/link' ) {
			const urlToLoad = 'file://' + assets.getPath( 'magic-links-unsupported.html' );
			log.info( `Navigating to URL: '${ urlToLoad }'` );
			view.webContents.loadURL( urlToLoad );
		}

		return;
	} );

	// This is to fix an issue where certain links like Post Preview in the editor
	// were not opening properly because of how the links were created.
	// This allows us to capture the url of a link when hovered and then navigate
	// to it in the new-window event listener above if the url sent to it is blank
	view.webContents.on( 'update-target-url', function ( event, url ) {
		targetURL = url;
	} );

	view.webContents.on( 'will-redirect', function ( _, url ) {
		log.info( 'Will redirect: ' + url );
		if ( url.includes( 'https://wordpress.com/log-in/apple/callback' ) ) {
			//log.info( 'Redirecting to URL: ', url );
			view.webContents.loadURL( url );
		}
	} );
};
