/**
 * Internal dependencies
 */
import { hasGutenbergBlocks } from './has-gutenberg-blocks';

/**
 * Automatically add paragraph and break tags
 *
 * Adapted from WordPress
 *
 * @copyright 2015 by the WordPress contributors.
 * @see wp-admin/js/editor.js
 *
 * @param {string} pee     html string
 * @returns {string}        html string with HTML paragraphs instead of double line-breaks
 */
export function wpautop( pee ) {
	if ( hasGutenbergBlocks( pee ) ) {
		return pee.replace( /-->\s+<!--/g, '--><!--' );
	}

	const blocklist =
		'table|thead|tfoot|caption|col|colgroup|tbody|tr|td|th|div|dl|dd|dt|ul|ol|li|pre' +
		'|form|map|area|blockquote|address|math|style|p|h[1-6]|hr|fieldset|legend|section' +
		'|article|aside|hgroup|header|footer|nav|figure|figcaption|details|menu|summary';

	let preserve_linebreaks = false;
	let preserve_br = false;

	if ( pee.indexOf( '<object' ) !== -1 ) {
		pee = pee.replace( /<object[\s\S]+?<\/object>/g, function ( a ) {
			return a.replace( /[\r\n]+/g, '' );
		} );
	}

	pee = pee.replace( /<[^<>]+>/g, function ( a ) {
		return a.replace( /[\r\n]+/g, ' ' );
	} );

	// Protect pre|script tags
	if ( pee.indexOf( '<pre' ) !== -1 || pee.indexOf( '<script' ) !== -1 ) {
		preserve_linebreaks = true;
		pee = pee.replace( /<(pre|script)[^>]*>[\s\S]+?<\/\1>/g, function ( a ) {
			return a.replace( /(\r\n|\n)/g, '<wp-line-break>' );
		} );
	}

	// keep <br> tags inside captions and convert line breaks
	if ( pee.indexOf( '[caption' ) !== -1 ) {
		preserve_br = true;
		pee = pee.replace( /\[caption[\s\S]+?\[\/caption\]/g, function ( a ) {
			// keep existing <br>
			a = a.replace( /<br([^>]*)>/g, '<wp-temp-br$1>' );
			// no line breaks inside HTML tags
			a = a.replace( /<[a-zA-Z0-9]+( [^<>]+)?>/g, function ( b ) {
				return b.replace( /[\r\n\t]+/, ' ' );
			} );
			// convert remaining line breaks to <br>
			return a.replace( /\s*\n\s*/g, '<wp-temp-br />' );
		} );
	}

	pee = pee + '\n\n';
	pee = pee.replace( /<br \/>\s*<br \/>/gi, '\n\n' );
	pee = pee.replace( new RegExp( '(<(?:' + blocklist + ')(?: [^>]*)?>)', 'gi' ), '\n$1' );
	pee = pee.replace( new RegExp( '(</(?:' + blocklist + ')>)', 'gi' ), '$1\n\n' );
	pee = pee.replace( /<hr( [^>]*)?>/gi, '<hr$1>\n\n' ); // hr is self closing block element
	pee = pee.replace( /\s*<option/gi, '<option' ); // No <p> or <br> around <option>
	pee = pee.replace( /<\/option>\s*/gi, '</option>' );
	pee = pee.replace( /\r\n|\r/g, '\n' );
	pee = pee.replace( /\n\s*\n+/g, '\n\n' );
	pee = pee.replace( /([\s\S]+?)\n\n/g, '<p>$1</p>\n' );
	pee = pee.replace( /<p>\s*?<\/p>/gi, '' );
	pee = pee.replace(
		new RegExp( '<p>\\s*(</?(?:' + blocklist + ')(?: [^>]*)?>)\\s*</p>', 'gi' ),
		'$1'
	);
	pee = pee.replace( /<p>(<li.+?)<\/p>/gi, '$1' );
	pee = pee.replace( /<p>\s*<blockquote([^>]*)>/gi, '<blockquote$1><p>' );
	pee = pee.replace( /<\/blockquote>\s*<\/p>/gi, '</p></blockquote>' );
	pee = pee.replace( new RegExp( '<p>\\s*(</?(?:' + blocklist + ')(?: [^>]*)?>)', 'gi' ), '$1' );
	pee = pee.replace( new RegExp( '(</?(?:' + blocklist + ')(?: [^>]*)?>)\\s*</p>', 'gi' ), '$1' );
	pee = pee.replace( /\s*\n/gi, '<br />\n' );
	pee = pee.replace( new RegExp( '(</?(?:' + blocklist + ')[^>]*>)\\s*<br />', 'gi' ), '$1' );
	pee = pee.replace( /<br \/>(\s*<\/?(?:p|li|div|dl|dd|dt|th|pre|td|ul|ol)>)/gi, '$1' );
	pee = pee.replace(
		/(?:<p>|<br ?\/?>)*\s*\[caption([^[]+)\[\/caption\]\s*(?:<\/p>|<br ?\/?>)*/gi,
		'[caption$1[/caption]'
	);

	pee = pee.replace( /(<(?:div|th|td|form|fieldset|dd)[^>]*>)(.*?)<\/p>/g, function ( a, b, c ) {
		if ( c.match( /<p( [^>]*)?>/ ) ) {
			return a;
		}

		return b + '<p>' + c + '</p>';
	} );

	// put back the line breaks in pre|script
	if ( preserve_linebreaks ) {
		pee = pee.replace( /<wp-line-break>/g, '\n' );
	}

	if ( preserve_br ) {
		pee = pee.replace( /<wp-temp-br([^>]*)>/g, '<br$1>' );
	}

	return pee;
}
