/**
 * Internal dependencies
 */
import { hasGutenbergBlocks } from './has-gutenberg-blocks';

export function removep( html ) {
	if ( hasGutenbergBlocks( html ) ) {
		return html.replace( /-->\s*<!-- wp:/g, '-->\n\n<!-- wp:' );
	}

	const blocklist = 'blockquote|ul|ol|li|table|thead|tbody|tfoot|tr|th|td|h[1-6]|fieldset';
	const blocklist1 = blocklist + '|div|p';
	const blocklist2 = blocklist + '|pre';

	let preserve_linebreaks = false;
	let preserve_br = false;

	if ( ! html ) {
		return '';
	}

	// Protect pre|script tags
	if ( html.indexOf( '<pre' ) !== -1 || html.indexOf( '<script' ) !== -1 ) {
		preserve_linebreaks = true;
		html = html.replace( /<(pre|script)[^>]*>[\s\S]+?<\/\1>/g, function ( a ) {
			a = a.replace( /<br ?\/?>(\r\n|\n)?/g, '<wp-line-break>' );
			a = a.replace( /<\/?p( [^>]*)?>(\r\n|\n)?/g, '<wp-line-break>' );
			return a.replace( /\r?\n/g, '<wp-line-break>' );
		} );
	}

	// keep <br> tags inside captions and remove line breaks
	if ( html.indexOf( '[caption' ) !== -1 ) {
		preserve_br = true;
		html = html.replace( /\[caption[\s\S]+?\[\/caption\]/g, function ( a ) {
			return a.replace( /<br([^>]*)>/g, '<wp-temp-br$1>' ).replace( /[\r\n\t]+/, '' );
		} );
	}

	// Pretty it up for the source editor
	html = html.replace( new RegExp( '\\s*</(' + blocklist1 + ')>\\s*', 'g' ), '</$1>\n' );
	html = html.replace( new RegExp( '\\s*<((?:' + blocklist1 + ')(?: [^>]*)?)>', 'g' ), '\n<$1>' );

	// Mark </p> if it has any attributes.
	html = html.replace( /(<p [^>]+>.*?)<\/p>/g, '$1</p#>' );

	// Separate <div> containing <p>
	html = html.replace( /<div( [^>]*)?>\s*<p>/gi, '<div$1>\n\n' );

	// Remove <p> and <br />
	html = html.replace( /\s*<p>/gi, '' );
	html = html.replace( /\s*<\/p>\s*/gi, '\n\n' );
	html = html.replace( /\n[\s\u00a0]+\n/g, '\n\n' );
	html = html.replace( /\s*<br ?\/?>\s*/gi, '\n' );

	// Fix some block element newline issues
	html = html.replace( /\s*<div/g, '\n<div' );
	html = html.replace( /<\/div>\s*/g, '</div>\n' );
	html = html.replace( /\s*\[caption([^[]+)\[\/caption\]\s*/gi, '\n\n[caption$1[/caption]\n\n' );
	html = html.replace( /caption\]\n\n+\[caption/g, 'caption]\n\n[caption' );

	html = html.replace(
		new RegExp( '\\s*<((?:' + blocklist2 + ')(?: [^>]*)?)\\s*>', 'g' ),
		'\n<$1>'
	);
	html = html.replace( new RegExp( '\\s*</(' + blocklist2 + ')>\\s*', 'g' ), '</$1>\n' );
	html = html.replace( /<li([^>]*)>/g, '\t<li$1>' );

	if ( html.indexOf( '<option' ) !== -1 ) {
		html = html.replace( /\s*<option/g, '\n<option' );
		html = html.replace( /\s*<\/select>/g, '\n</select>' );
	}

	if ( html.indexOf( '<hr' ) !== -1 ) {
		html = html.replace( /\s*<hr( [^>]*)?>\s*/g, '\n\n<hr$1>\n\n' );
	}

	if ( html.indexOf( '<object' ) !== -1 ) {
		html = html.replace( /<object[\s\S]+?<\/object>/g, function ( a ) {
			return a.replace( /[\r\n]+/g, '' );
		} );
	}

	// Unmark special paragraph closing tags
	html = html.replace( /<\/p#>/g, '</p>\n' );
	html = html.replace( /\s*(<p [^>]+>[\s\S]*?<\/p>)/g, '\n$1' );

	// Trim whitespace
	html = html.replace( /^\s+/, '' );
	html = html.replace( /[\s\u00a0]+$/, '' );

	// put back the line breaks in pre|script
	if ( preserve_linebreaks ) {
		html = html.replace( /<wp-line-break>/g, '\n' );
	}

	// and the <br> tags in captions
	if ( preserve_br ) {
		html = html.replace( /<wp-temp-br([^>]*)>/g, '<br$1>' );
	}

	return html;
}
