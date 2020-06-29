'use strict';
/* global electron */

let startApp = function() {
	document.location.replace( '/desktop/hey.html' );
};

let booted = false;
let log;

function startDesktopApp() {
	function showWarning( message ) {
		var container = document.querySelector( '#wpcom' );
		var warning = container.querySelector( '.warning' );

		if ( ! warning ) {
			const node = document.createElement( 'div' );

			node.className = 'warning';
			container.appendChild( node );

			warning = container.querySelector( '.warning' );
		}

		warning.innerHTML = message;
	}

	function showNoConnection() {
		showWarning( 'You have no connection to the Internet. WordPress.com will start once your connection has resumed.' );
	}

	function showNoCalypso() {
		showWarning( 'Unable to connect to WordPress.com. <button onclick="document.location.reload()">Try again?</button>' );
	}

	function postCalypso() {
		// Ensure the dock notification badge is cleared immediatley when notification icon is clicked
		// The iframe postMessage can be delayed
		var notIcon = document.querySelector( '#header li.notifications a' );

		if ( notIcon ) {
			notIcon.addEventListener( 'click', function() {
				electron.ipcRenderer.send( 'unread-notices-count', 0 );
			} );
		}
	}

	function calysoHasLoaded() {
		return document.getElementById( 'content' );
	}

	function checkForCalypso() {
		setTimeout( function() {
			if ( ! calysoHasLoaded() ) {
				showNoCalypso();
				checkForCalypso();
			} else {
				postCalypso();
			}
		}, 5000 );
	}

	function keyboardHandler( ev ) {
		if ( ev.keyCode === 8 && document.location.pathname.indexOf( '/read' ) === 0 && ev.target.tagName !== 'INPUT' && ev.target.tagName !== 'TEXTAREA' ) {
			window.history.back()
		} else if ( ev.keyCode === 73 && ev.shiftKey === true && ev.ctrlKey === true ) {
			electron.ipcRenderer.send( 'toggle-dev-tools' );
		}
	}

	function preventNewWindow( ev ) {
		if ( ev.metaKey === true ) {
			ev.preventDefault();
		}
	}

	// Uses the logger object instantiated by preload.js
	log = logger( 'desktop:renderer:browser' ); // eslint-disable-line no-undef

	// Everything is ready, start Calypso
	log.info( 'Received app configuration, starting in browser' );

	function startCalypso() {
		log.info( 'Calypso loaded, starting' );
		booted = true;
		window.AppBoot();

		document.addEventListener( 'keydown', keyboardHandler );
		document.addEventListener( 'click', preventNewWindow );
	}

	// This is called by Calypso
	startApp = function() {
		document.addEventListener( 'dragover', ev => {
			if ( [ ... event.dataTransfer.types ].includes( 'text/uri-list' ) ) {
				ev.preventDefault();
			}
		} );

		document.addEventListener( 'drop', ev => {
			if ( ev.dataTransfer.dropEffect === 'none' ) {
				ev.preventDefault();
			}
		} );

		window.addEventListener( 'online', function() {
			if ( booted === false ) {
				document.location.reload();
			}
		} );

		document.documentElement.classList.add( 'build-' + electron.getBuild() );

		if ( navigator.onLine ) {
			startCalypso();

			if ( calysoHasLoaded() ) {
				postCalypso();
			} else {
				checkForCalypso();
			}
		} else {
			showNoConnection();
		}
	}
}

// Wrap this in an exception handler. If it fails then it means Electron is not present, and we are in a browser
// This will then cause the browser to redirect to hey.html
try {
	electron.ipcRenderer.on( 'is-calypso', function() {
		electron.ipcRenderer.send( 'is-calypso-response', document.getElementById( 'wpcom' ) !== null );
	} );

	electron.ipcRenderer.on( 'app-config', function( event, config, debug, details ) {
		// if this is the first run, and on the login page, show Windows and Mac users a pin app reminder
		if ( details.firstRun && document.querySelectorAll( '.logged-out-auth' ).length > 0 ) {
			if ( details.platform === 'windows' || details.platform === 'darwin' ) {
				var container = document.querySelector( '#wpcom' );
				var pinApp = container.querySelector( '.pin-app' );

				if ( ! pinApp ) {
					var node = document.createElement( 'div' );
					node.className = 'pin-app';
					container.appendChild( node );
					pinApp = container.querySelector( '.pin-app' );
				}

				var closeButton = '<a href="#" class="pin-app-close"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M17.705,7.705l-1.41-1.41L12,10.59L7.705,6.295l-1.41,1.41L10.59,12l-4.295,4.295l1.41,1.41L12,13.41 l4.295,4.295l1.41-1.41L13.41,12L17.705,7.705z"/></svg></a>';
				var pinAppMsg = '';

				if ( details.platform === 'windows' ) {
					pinAppMsg = '<h2>Keep WordPress.com in your taskbar</h2>' +
					'<p>Drag the icon from your desktop to your taskbar</p>' +
					'<img src="/desktop/pin-app-taskbar.png" alt="" width="143" height="27" />';
				} else if ( details.platform === 'darwin' && !details.pinned ) {
					pinAppMsg = '<h2>Keep WordPress.com in your dock</h2>' +
					'<p>Right-click the WordPress.com icon in your dock, select Options > Keep in Dock</p>' +
					'<img src="/desktop/pin-app-dock.png" alt="" width="128" height="30" />';
				}

				pinApp.innerHTML = closeButton + pinAppMsg;

				// close button
				var pinAppClose = container.querySelector( '.pin-app-close' );
				pinAppClose.onclick = function() {
					pinApp.style.display = 'none';
				};
			}
		}
	} );
} catch ( e ) {
	console.log( 'Failed to initialize calypso', e.message );
}

startDesktopApp();
