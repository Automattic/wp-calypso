/**
 * External dependencies
 */

import tinymce from 'tinymce/tinymce';
import twemoji from 'twemoji';
import config from 'config';

/**
 * TinyMCE plugin tweaking Markdown behaviour.
 *
 * @param {object} editor TinyMCE editor instance
 */
function wpemoji( editor ) {
	let typing = false;
	const env = tinymce.Env,
		ua = window.navigator.userAgent,
		isWin = ua.indexOf( 'Windows' ) > -1,
		isWin8 = ( function () {
			const match = ua.match( /Windows NT 6\.(\d)/ );

			if ( match && match[ 1 ] > 1 ) {
				return true;
			}

			return false;
		} )();

	function setImgAttr( image ) {
		image.className = 'emoji';
		image.setAttribute( 'data-mce-resize', 'false' );
		image.setAttribute( 'data-mce-placeholder', '1' );
		image.setAttribute( 'data-wp-emoji', '1' );
	}

	function replaceEmoji( node ) {
		twemoji.parse( node, {
			base: config( 'twemoji_cdn_url' ),
			size: '72x72',
			attributes: () => {
				return {
					'data-mce-resize': 'false',
					'data-mce-placeholder': '1',
					'data-wp-emoji': '1',
				};
			},
			callback: ( icon, options ) => {
				const ignored = [ 'a9', 'ae', '2122', '2194', '2660', '2663', '2665', '2666' ];

				if ( -1 !== ignored.indexOf( icon ) ) {
					return false;
				}

				return ''.concat( options.base, options.size, '/', icon, options.ext );
			},
		} );
	}

	// Test if the node text contains emoji char(s) and replace.
	function parseNode( node ) {
		let selection, bookmark;

		if ( node && twemoji.test( node.textContent || node.innerText ) ) {
			if ( env.webkit ) {
				selection = editor.selection;
				bookmark = selection.getBookmark();
			}

			replaceEmoji( node );

			if ( env.webkit ) {
				selection.moveToBookmark( bookmark );
			}
		}
	}

	if ( isWin8 ) {
		// Windows 8+ emoji can be "typed" with the onscreen keyboard.
		// That triggers the normal keyboard events, but not the 'input' event.
		// Thankfully it sets keyCode 231 when the onscreen keyboard inserts any emoji.
		editor.on( 'keyup', function ( event ) {
			if ( event.keyCode === 231 ) {
				parseNode( editor.selection.getNode() );
			}
		} );
	} else if ( ! isWin ) {
		// In MacOS inserting emoji doesn't trigger the standard keyboard events.
		// Thankfully it triggers the 'input' event.
		// This works in Android and iOS as well.
		editor.on( 'keydown keyup', function ( event ) {
			typing = event.type === 'keydown';
		} );

		editor.on( 'input', function () {
			if ( typing ) {
				return;
			}

			parseNode( editor.selection.getNode() );
		} );
	}

	editor.on( 'setcontent', function () {
		parseNode( editor.selection.getNode() );
	} );

	// Convert Twemoji compatible pasted emoji replacement images into our format.
	editor.on( 'PastePostProcess', function ( event ) {
		tinymce.each( editor.dom.$( 'img.emoji', event.node ), function ( image ) {
			if ( image.alt && twemoji.test( image.alt ) ) {
				setImgAttr( image );
			}
		} );
	} );

	editor.on( 'postprocess', function ( event ) {
		if ( event.content ) {
			event.content = event.content.replace( /<img[^>]+data-wp-emoji="[^>]+>/g, function ( img ) {
				const alt = img.match( /alt="([^"]+)"/ );

				if ( alt && alt[ 1 ] ) {
					return alt[ 1 ];
				}

				return img;
			} );
		}
	} );

	editor.on( 'resolvename', function ( event ) {
		if (
			event.target.nodeName === 'IMG' &&
			editor.dom.getAttrib( event.target, 'data-wp-emoji' )
		) {
			event.preventDefault();
		}
	} );
}

export default function () {
	tinymce.PluginManager.add( 'wpemoji', wpemoji );
}
