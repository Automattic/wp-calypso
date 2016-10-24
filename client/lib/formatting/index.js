/**
 * External Dependencies
 */
import trim from 'lodash/trim';
import stripTags from 'striptags';

/**
 * Internal Dependencies
 */
import warn from 'lib/warn';
import decode from './decode-entities';

function decodeEntities( text ) {
	if ( text === undefined || text === false || text === null ) {
		warn( 'Don\'t call `decodeEntities` with an `undefined`, `false`, or `null` value.' );
		return text;
	}

	return decode( text );
}

/**
 * Inserts the specified separator betwixt every element of the given list.
 *
 * @param {*} separator - separator to be inserted
 * @param {*[]} list - list
 * @returns {*[]} the list with separators
 */
function interpose( separator, list ) {
	return list.reduce( function( previousValue, currentValue, index ) {
		let value;
		if ( index > 0 ) {
			value = previousValue.concat( separator, currentValue );
		} else {
			value = previousValue.concat( currentValue );
		}
		return value;
	}, [] );
}

/**
 * Strips HTML from a string. Does not handle tags nested in attribute strings.
 * @param  {string} string The string to strip tags from
 * @return {string}        The stripped string
 */
function stripHTML( string ) {
	return stripTags( string );
}

/**
 * Prevent widows by replacing spaces between the last `wordsToKeep` words in the text with non-breaking spaces
 * @param  {string} text        the text to work on
 * @param  {number} wordsToKeep the number of words to keep together
 * @return {string}             the widow-prevented string
 */
function preventWidows( text, wordsToKeep = 2 ) {
	let words, endWords;

	if ( typeof text !== 'string' ) {
		return text;
	}

	text = text && trim( text );
	if ( ! text ) {
		return text;
	}

	words = text.match( /\S+/g );
	if ( ! words || 1 === words.length ) {
		return text;
	}

	if ( words.length <= wordsToKeep ) {
		return words.join( '\xA0' );
	}

	endWords = words.splice( -wordsToKeep, wordsToKeep );

	return words.join( ' ' ) + ' ' + endWords.join( '\xA0' );
}

/**
 * Automatically add paragraph and break tags
 *
 * Adapted from WordPress
 *
 * @copyright 2015 by the WordPress contributors.
 * @license See CREDITS.md.
 * @see wp-admin/js/editor.js
 *
 * @param {string} pee     html string
 * @return {string}        html string with HTML paragraphs instead of double line-breaks
 */
function wpautop( pee ) {
	const blocklist = 'table|thead|tfoot|caption|col|colgroup|tbody|tr|td|th|div|dl|dd|dt|ul|ol|li|pre' +
		'|form|map|area|blockquote|address|math|style|p|h[1-6]|hr|fieldset|legend|section' +
		'|article|aside|hgroup|header|footer|nav|figure|figcaption|details|menu|summary';

	let preserve_linebreaks = false,
		preserve_br = false;

	if ( pee.indexOf( '<object' ) !== -1 ) {
		pee = pee.replace( /<object[\s\S]+?<\/object>/g, function( a ) {
			return a.replace( /[\r\n]+/g, '' );
		} );
	}

	pee = pee.replace( /<[^<>]+>/g, function( a ) {
		return a.replace( /[\r\n]+/g, ' ' );
	} );

	// Protect pre|script tags
	if ( pee.indexOf( '<pre' ) !== -1 || pee.indexOf( '<script' ) !== -1 ) {
		preserve_linebreaks = true;
		pee = pee.replace( /<(pre|script)[^>]*>[\s\S]+?<\/\1>/g, function( a ) {
			return a.replace( /(\r\n|\n)/g, '<wp-line-break>' );
		} );
	}

	// keep <br> tags inside captions and convert line breaks
	if ( pee.indexOf( '[caption' ) !== -1 ) {
		preserve_br = true;
		pee = pee.replace( /\[caption[\s\S]+?\[\/caption\]/g, function( a ) {
			// keep existing <br>
			a = a.replace( /<br([^>]*)>/g, '<wp-temp-br$1>' );
			// no line breaks inside HTML tags
			a = a.replace( /<[a-zA-Z0-9]+( [^<>]+)?>/g, function( b ) {
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
	pee = pee.replace( new RegExp( '<p>\\s*(</?(?:' + blocklist + ')(?: [^>]*)?>)\\s*</p>', 'gi' ), '$1' );
	pee = pee.replace( /<p>(<li.+?)<\/p>/gi, '$1' );
	pee = pee.replace( /<p>\s*<blockquote([^>]*)>/gi, '<blockquote$1><p>' );
	pee = pee.replace( /<\/blockquote>\s*<\/p>/gi, '</p></blockquote>' );
	pee = pee.replace( new RegExp( '<p>\\s*(</?(?:' + blocklist + ')(?: [^>]*)?>)', 'gi' ), '$1' );
	pee = pee.replace( new RegExp( '(</?(?:' + blocklist + ')(?: [^>]*)?>)\\s*</p>', 'gi' ), '$1' );
	pee = pee.replace( /\s*\n/gi, '<br />\n' );
	pee = pee.replace( new RegExp( '(</?(?:' + blocklist + ')[^>]*>)\\s*<br />', 'gi' ), '$1' );
	pee = pee.replace( /<br \/>(\s*<\/?(?:p|li|div|dl|dd|dt|th|pre|td|ul|ol)>)/gi, '$1' );
	pee = pee.replace( /(?:<p>|<br ?\/?>)*\s*\[caption([^\[]+)\[\/caption\]\s*(?:<\/p>|<br ?\/?>)*/gi, '[caption$1[/caption]' );

	pee = pee.replace( /(<(?:div|th|td|form|fieldset|dd)[^>]*>)(.*?)<\/p>/g, function( a, b, c ) {
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

function removep( html ) {
	const blocklist = 'blockquote|ul|ol|li|table|thead|tbody|tfoot|tr|th|td|h[1-6]|fieldset';
	const blocklist1 = blocklist + '|div|p';
	const blocklist2 = blocklist + '|pre';

	let preserve_linebreaks = false,
		preserve_br = false;

	if ( ! html ) {
		return '';
	}

	// Protect pre|script tags
	if ( html.indexOf( '<pre' ) !== -1 || html.indexOf( '<script' ) !== -1 ) {
		preserve_linebreaks = true;
		html = html.replace( /<(pre|script)[^>]*>[\s\S]+?<\/\1>/g, function( a ) {
			a = a.replace( /<br ?\/?>(\r\n|\n)?/g, '<wp-line-break>' );
			a = a.replace( /<\/?p( [^>]*)?>(\r\n|\n)?/g, '<wp-line-break>' );
			return a.replace( /\r?\n/g, '<wp-line-break>' );
		} );
	}

	// keep <br> tags inside captions and remove line breaks
	if ( html.indexOf( '[caption' ) !== -1 ) {
		preserve_br = true;
		html = html.replace( /\[caption[\s\S]+?\[\/caption\]/g, function( a ) {
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
	html = html.replace( /\s*\[caption([^\[]+)\[\/caption\]\s*/gi, '\n\n[caption$1[/caption]\n\n' );
	html = html.replace( /caption\]\n\n+\[caption/g, 'caption]\n\n[caption' );

	html = html.replace( new RegExp( '\\s*<((?:' + blocklist2 + ')(?: [^>]*)?)\\s*>', 'g' ), '\n<$1>' );
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
		html = html.replace( /<object[\s\S]+?<\/object>/g, function( a ) {
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

function capitalPDangit( input ) {
	if ( 'string' !== typeof input ) {
		throw new Error( 'capitalPDangit expects a string as input' );
	}
	return input.replace( /Wordpress/g, 'WordPress' );
}

/**
 * Parses HTML by using the browser's built in string to DOM converter.
 *
 * @param  {String} html HTML String to be converted into DOM fragment
 * @return {Dom} DOM fragment that can be queried using built in browser functions.
 */
function parseHtml( html ) {
	if ( html && html.querySelector ) {
		return html;
	}

	if ( 'string' !== typeof html ) {
		return null;
	}

	// Element is a string and should be parsed
	const el = document.createElement( 'div' );
	el.innerHTML = html;

	const elements = el.children;
	const fragment = document.createDocumentFragment();

	// From https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild:
	// "If the given child is a reference to an existing node in the document,
	// appendChild() moves it from its current position to the new position."
	// i.e. `elements` nodes will move to `fragment`'s children.
	while ( elements.length > 0 ) {
		fragment.appendChild( elements[ 0 ] );
	}

	return fragment;
}

const nbsp = String.fromCharCode( 160 );

/**
 * Unescape HTML entities, then replace spaces with &nbsp;.
 *
 * This helper is used to transform tag names for rendering by React.  We need
 * to decode HTML entities in tag names because the REST API returns them
 * already escaped, and React will escape them again.  Also transform spaces to
 * non-breaking spaces so that tags like 'a   b' will display correctly (not
 * using '&nbsp;' for this because again, React will escape whatever we pass
 * in).
 *
 * @param	{String} str String to unescape in preparation for React rendering
 * @return	{String} Transformed string
 */
function unescapeAndFormatSpaces( str ) {
	return decodeEntities( str ).replace( / /g, nbsp );
}

module.exports = {
	decodeEntities: decodeEntities,
	interpose: interpose,
	stripHTML: stripHTML,
	preventWidows: preventWidows,
	wpautop: wpautop,
	removep: removep,
	capitalPDangit: capitalPDangit,
	parseHtml: parseHtml,
	unescapeAndFormatSpaces: unescapeAndFormatSpaces
};
