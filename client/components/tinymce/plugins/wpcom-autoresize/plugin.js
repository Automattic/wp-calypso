/**
 * WordPress TinyMCE Auto Resize plugin
 *
 * Adapted from WordPress.
 *
 *
 * @copyright 2015 by the WordPress contributors.
 */

/**
 * External dependencies
 */
import tinymce from 'tinymce/tinymce';

function wcpomAutoResize( editor ) {
	const settings = { ...editor.settings };
	let oldSize = 0;

	function isFullscreen() {
		return editor.plugins.fullscreen && editor.plugins.fullscreen.isFullscreen();
	}

	if ( editor.settings.inline ) {
		return;
	}

	function isEndOfEditor() {
		let element, child;
		const range = editor.selection.getRng();

		if ( ( range.startOffset === 0 && range.endOffset !== 0 ) || ! range.collapsed ) {
			return false;
		}

		const start = range.startContainer;
		const body = editor.getBody();
		element = start;
		do {
			child = element;
			element = element.parentNode;
			if ( element.childNodes[ element.childNodes.length - 1 ] !== child ) {
				return false;
			}
		} while ( element !== body );
		return true;
	}

	function resize( e ) {
		let deltaSize, resizeHeight, myHeight;
		const DOM = tinymce.DOM;
		const doc = editor.getDoc();
		const { body, documentElement: docElm } = doc;

		if ( ! doc ) {
			return;
		}

		resizeHeight = settings.autoresize_min_height;

		if ( ! body || ( e && e.type === 'setcontent' && e.initial ) || isFullscreen() ) {
			if ( body && docElm ) {
				body.style.overflowY = 'auto';
				docElm.style.overflowY = 'auto'; // Old IE
			}

			return;
		}

		// Calculate outer height of the body element using CSS styles
		const marginTop = editor.dom.getStyle( body, 'margin-top', true );
		const marginBottom = editor.dom.getStyle( body, 'margin-bottom', true );
		const paddingTop = editor.dom.getStyle( body, 'padding-top', true );
		const borderTop = editor.dom.getStyle( body, 'border-top-width', true );
		const borderBottom = editor.dom.getStyle( body, 'border-bottom-width', true );
		// paddingBottom seems to get reset to 1 somewhere, so grab
		// autoresize_bottom_margin directly here
		const paddingBottom = editor.getParam( 'autoresize_bottom_margin', 50 );

		myHeight =
			body.offsetHeight +
			parseInt( marginTop, 10 ) +
			parseInt( marginBottom, 10 ) +
			parseInt( paddingTop, 10 ) +
			parseInt( paddingBottom, 10 ) +
			parseInt( borderTop, 10 ) +
			parseInt( borderBottom, 10 );

		// IE < 11, other?
		if ( myHeight && myHeight < docElm.offsetHeight ) {
			myHeight = docElm.offsetHeight;
		}

		// Make sure we have a valid height
		if ( isNaN( myHeight ) || myHeight <= 0 ) {
			// Get height differently depending on the browser used
			if ( tinymce.Env.ie ) {
				myHeight = body.scrollHeight;
			} else if ( tinymce.Env.webkit && body.clientHeight === 0 ) {
				myHeight = 0;
			} else {
				myHeight = body.offsetHeight;
			}
		}

		// Don't make it smaller than the minimum height
		if ( myHeight > settings.autoresize_min_height ) {
			resizeHeight = myHeight;
		}

		// If a maximum height has been defined don't exceed this height
		if ( settings.autoresize_max_height && myHeight > settings.autoresize_max_height ) {
			resizeHeight = settings.autoresize_max_height;
			body.style.overflowY = 'auto';
			docElm.style.overflowY = 'auto'; // Old IE
		} else {
			body.style.overflowY = 'hidden';
			docElm.style.overflowY = 'hidden'; // Old IE
			body.scrollTop = 0;
		}

		// Resize content element
		if ( resizeHeight !== oldSize ) {
			deltaSize = resizeHeight - oldSize;
			DOM.setStyle( editor.iframeElement, 'height', resizeHeight + 'px' );
			oldSize = resizeHeight;

			// WebKit doesn't decrease the size of the body element until the iframe gets resized
			// So we need to continue to resize the iframe down until the size gets fixed
			if ( tinymce.isWebKit && deltaSize < 0 ) {
				resize( e );
			}

			if (
				( e && e.type === 'keyup' ) ||
				( e && e.type === 'nodechange' && e.element && e.element.tagName === 'BR' )
			) {
				if ( isEndOfEditor() ) {
					window.scrollTo( 0, document.body.scrollHeight );
				}
			}
		}
	}

	function wait( times, interval, callback ) {
		setTimeout( function () {
			resize( {} );

			if ( times-- ) {
				wait( times, interval, callback );
			} else if ( callback ) {
				callback();
			}
		}, interval );
	}

	// Define minimum height
	settings.autoresize_min_height = parseInt(
		editor.getParam( 'autoresize_min_height', editor.getElement().offsetHeight ),
		10
	);

	// Define maximum height
	settings.autoresize_max_height = parseInt( editor.getParam( 'autoresize_max_height', 0 ), 10 );

	// Add padding at the bottom for better UX
	editor.on( 'init', function () {
		const overflowPadding = editor.getParam( 'autoresize_overflow_padding', 1 );
		const bottomMargin = editor.getParam( 'autoresize_bottom_margin', 50 );

		if ( overflowPadding !== false ) {
			editor.dom.setStyles( editor.getBody(), {
				paddingLeft: overflowPadding,
				paddingRight: overflowPadding,
			} );
		}

		if ( bottomMargin !== false ) {
			editor.dom.setStyles( editor.getBody(), {
				paddingBottom: bottomMargin,
			} );
		}
	} );

	// Add appropriate listeners for resizing content area
	editor.on( 'nodechange setcontent keyup FullscreenStateChanged', resize );

	if ( editor.getParam( 'autoresize_on_init', true ) ) {
		editor.on( 'init', function () {
			editor.dom.addClass( editor.getBody(), 'wp-autoresize' );

			// Hit it 20 times in 100 ms intervals
			wait( 20, 100, function () {
				// Hit it 5 times in 1 sec intervals
				wait( 5, 1000 );
			} );
		} );
	}

	// Register the command so that it can be invoked by using tinyMCE.activeEditor.execCommand('wpcomAutoResize');
	editor.addCommand( 'wpcomAutoResize', resize );
}

export default function () {
	tinymce.PluginManager.add( 'wpcom/autoresize', wcpomAutoResize );
}
