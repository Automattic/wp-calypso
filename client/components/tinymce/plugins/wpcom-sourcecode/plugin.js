/**
 * External dependencies
 */

import tinymce from 'tinymce/tinymce';

/**
 * Module variables
 */
const REGEXP_CODE_SHORTCODE = new RegExp(
	'(?:<p>\\s*)?(?:<pre>\\s*)?(\\[(code|sourcecode)[^\\]]*\\][\\s\\S]*?\\[\\/\\2\\])(?:\\s*<\\/pre>)?(?:\\s*<\\/p>)?',
	'gi'
);

export function wrapPre( { content, initial, load } ) {
	return ( content = content.replace( REGEXP_CODE_SHORTCODE, function ( match, shortcode ) {
		shortcode = shortcode.replace( /\r/, '' );
		shortcode = shortcode.replace( /<br ?\/?>\n?/g, '\n' ).replace( /<\/?p( [^>]*)?>\n?/g, '\n' );

		// Ensure shortcode contents hit TinyMCE with characters escaped, else
		// they'll be rendered as DOM nodes.
		//
		// See: https://github.com/tinymce/tinymce/blob/a9561a4/js/tinymce/classes/Editor.js#L1619
		//
		// Event arguments:
		//  - `initial`: When calling `setContent` on a TinyMCE component
		//    instance, value is assumed to already be escaped
		//  - `load`: When TinyMCE loads, it sets content from the underlying
		//    textarea, whose value is decoded and needs entities replaced
		if ( ! initial || load ) {
			shortcode = shortcode
				.replace( /&/g, '&amp;' )
				.replace( /</g, '&lt;' )
				.replace( />/g, '&gt;' );
		}

		return `<pre>${ shortcode }</pre>`;
	} ) );
}

export function unwrapPre( { content } ) {
	if ( ! content || content.indexOf( '[' ) === -1 ) {
		return content;
	}

	return content.replace( REGEXP_CODE_SHORTCODE, function ( match, shortcode ) {
		shortcode = shortcode.replace( /&lt;/g, '<' ).replace( /&gt;/g, '>' ).replace( /&amp;/g, '&' );

		return `<p>${ shortcode }</p>`;
	} );
}

function sourcecode( editor ) {
	editor.on( 'BeforeSetContent', ( event ) => {
		if ( ! event.content || 'html' === event.mode ) {
			return;
		}

		event.content = wrapPre( event );
	} );

	editor.on( 'GetContent', ( event ) => {
		if ( event.format !== 'raw' || ! event.content || event.selection ) {
			return;
		}

		event.content = unwrapPre( event );
	} );

	editor.on( 'PostProcess', ( event ) => {
		if ( ! event.content ) {
			return;
		}

		event.content = unwrapPre( event );
	} );
}

export default function () {
	tinymce.PluginManager.add( 'wpcom/sourcecode', sourcecode );
}
