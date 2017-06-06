'use strict';

var startApp = function() {
	document.location.replace( '/desktop/hey.html' );
};

var electron;
var ipc;
var gGebug;
var desktop;
var debug;
var booted = false;
var spellchecker;
var selection;
var webFrame;
var loadContextMenu = true;

function startDesktopApp() {
	if ( desktop.settings.isDebug() ) {
		// Enable debug
		gGebug.enable( desktop.config.debug.namespace );

		// Link the debug function so it outputs to the console and sends it back to our main process for logging
		gGebug.log = function() {
			ipc.send( 'debug', arguments );
			console.log.apply( console, arguments );
		}
	}

	function showWarning( message ) {
		var container = document.querySelector( '#wpcom' );
		var warning = container.querySelector( '.warning' );

		if ( ! warning ) {
			var node = document.createElement( 'div' );

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
				ipc.send( 'unread-notices-count', 0 );
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
			ipc.send( 'toggle-dev-tools' );
		}
	}

	function preventNewWindow( ev ) {
		if ( ev.metaKey === true ) {
			ev.preventDefault();
		}
	}

	function contextMenu( ev ) {
		var menu = {};
		var showEditorMenu = false;

		// check if in visual editor, ipc sends an EventEmitter
		if ( typeof ev.sender !== 'undefined' )  {
			showEditorMenu = true;
		}
		// check if in textarea or similar
		else if ( ( typeof ev.target !== 'undefined' ) && ev.target.closest( 'textarea, input, [contenteditable="true"]' ) ) {
			showEditorMenu = true;
		}

		if ( showEditorMenu ) {
			menu = desktop.contextMenus.editor(selection);
		}
		else {
			var selectedText = window.getSelection().toString();
			menu = desktop.contextMenus.general(selectedText);
		}

		// The 'contextmenu' event is emitted after 'selectionchange' has fired but possibly before the
		// visible selection has changed. Try to wait to show the menu until after that, otherwise the
		// visible selection will update after the menu dismisses and look weird.
		setTimeout(function() {
			menu.popup(electron.remote.getCurrentWindow());
		}, 30);
	}

	function resetSelection() {
		selection = {
			isMisspelled: false,
			spellingSuggestions: []
		};
	}


	debug = gGebug( 'desktop:browser' );

	// Everything is ready, start Calypso
	debug( 'Received app configuration, starting in browser' );

	function startCalypso() {
		debug( 'Calypso loaded, starting' );
		booted = true;
		window.AppBoot();

		document.addEventListener( 'keydown', keyboardHandler );
		document.addEventListener( 'click', preventNewWindow );

		if ( loadContextMenu ) {
			debug( 'Setting up Context Menus' );

			resetSelection();

			document.addEventListener( 'mousedown', resetSelection );
			document.addEventListener( 'contextmenu', contextMenu );

			// listen for tinymce IPC event for context menu
			// required for visual editor since within iframe
			ipc.on( 'mce-contextmenu', contextMenu );
		}
	}

	// This is called by Calypso
	startApp = function() {
		window.addEventListener( 'online', function() {
			if ( booted === false ) {
				document.location.reload();
			}
		} );

		document.documentElement.classList.add( 'build-' + desktop.config.build );

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

// hard code wrongly interpreted words in spellchecker
// electron has a bug with parsing of contractions
// Ref: https://github.com/atom/electron/issues/1005
var wordsToSpellSkip = {
	'en-us': ['ain', 'couldn', 'didn', 'doesn', 'hadn', 'hasn', 'mightn', 'mustn', 'needn', 'oughtn', 'shan', 'shouldn', 'wasn', 'weren', 'wouldn']
};

function shouldNotSpellCheckWord( locale, text ) {
	return ( wordsToSpellSkip[locale.toLowerCase()].indexOf(text) > 0 );
}

function setupSpellchecker( locale ) {
	if ( !desktop.settings.getSetting( 'spellcheck-enabled' ) ) {
		debug( 'Spellchecker not enabled; skipping setup' );
		return;
	}

	if ( locale.toLowerCase() !== 'en-us' ) {
		debug( 'Disabling spellcheck, temporary only en-us support' );
		return;
	}

	if ( process.platform === 'win32' ) {
		debug( 'Disabling spellcheck, Windows support not working' );
		return;
	}

	try {
		spellchecker = electron.remote.require( 'spellchecker' );

		webFrame.setSpellCheckProvider( locale, false, {
			spellCheck: function(text) {
				if ( shouldNotSpellCheckWord( locale, text ) ) {
					return true;
				}

				if ( spellchecker.isMisspelled(text) ) {
					var suggestions = spellchecker.getCorrectionsForMisspelling(text);
					selection.isMisspelled = true;
					selection.spellingSuggestions = suggestions.slice(0, 3);
					return false;
				} else {
					return true;
				}
			} } );
	} catch ( e ) {
		debug( 'Failed to initialize spellchecker', e.message );
	}
}


// Wrap this in an exception handler. If it fails then it means Electron is not present, and we are in a browser
// This will then cause the browser to redirect to hey.html
try {
	electron = require( 'electron' );
	ipc = electron.ipcRenderer;
	gGebug = electron.remote.require( 'debug' );
	desktop = electron.remote.getGlobal( 'desktop' );
	webFrame = electron.webFrame;

	ipc.on( 'is-calypso', function() {
		ipc.send( 'is-calypso-response', document.getElementById( 'wpcom' ) !== null );

	} );


	ipc.on( 'app-config', function( event, config, debug, details ) {

		// if this is the first run, and on the login page, show Windows and Mac users a pin app reminder
		if ( details.firstRun && document.querySelectorAll('.logged-out-auth').length > 0 ) {
			if ( details.platform === "windows" || details.platform === "darwin" ) {

				var container = document.querySelector( '#wpcom' );
				var pinApp = container.querySelector( '.pin-app' );

				if ( ! pinApp ) {
					var node = document.createElement( 'div' );
					node.className = 'pin-app';
					container.appendChild( node );
					pinApp = container.querySelector( '.pin-app' );
				}

				var closeButton = '<a href="#" class="pin-app-close"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M17.705,7.705l-1.41-1.41L12,10.59L7.705,6.295l-1.41,1.41L10.59,12l-4.295,4.295l1.41,1.41L12,13.41 l4.295,4.295l1.41-1.41L13.41,12L17.705,7.705z"/></svg></a>';
				var pinAppMsg = "";

				if ( details.platform === "windows" ) {
					pinAppMsg = "<h2>Keep WordPress.com in your taskbar</h2>" +
					"<p>Drag the icon from your desktop to your taskbar</p>" +
					'<img src="/desktop/pin-app-taskbar.png" alt="" width="143" height="27" />';
				} else if ( details.platform === "darwin" && !details.pinned ) {
					pinAppMsg = "<h2>Keep WordPress.com in your dock</h2>" +
					"<p>Right-click the WordPress.com icon in your dock, select Options > Keep in Dock</p>" +
					'<img src="/desktop/pin-app-dock.png" alt="" width="128" height="30" />';
				}

				pinApp.innerHTML = closeButton + pinAppMsg;

				// close button
				var pinAppClose = container.querySelector( '.pin-app-close' );
				pinAppClose.onclick = function () {
					pinApp.style.display = "none";
				};
			}
		}

	} );

} catch ( e ) {
	debug( 'Failed to initialize calypso', e.message );
}

startDesktopApp();
setupSpellchecker( window.navigator.language );
