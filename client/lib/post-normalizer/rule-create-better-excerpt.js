/**
 * External dependencies
 */

import striptags from 'striptags';
import { trim, toArray, forEach } from 'lodash';

/**
 * Internal Dependencies
 */
import { domForHtml } from './utils';

/**
 *  removes an html element from the dom
 */
function removeElement( element ) {
	element.parentNode && element.parentNode.removeChild( element );
}

/**
 *  Trims any empty starting br tags.  Recurses into non-empty tags.
 *  will remove all of the leading brs it can find.
 */
function stripLeadingBreaklines( dom ) {
	if ( ! dom ) {
		return;
	}

	// first element is breakline actually returns the node in case of success
	while ( firstElementIsBreakline( dom ) ) {
		removeElement( firstElementIsBreakline( dom ) );
	}
}

/**
 *  Returns the node if first element ( checking nested ) is a br
 *  else returns falsy
 */
function firstElementIsBreakline( dom ) {
	if ( dom.childNodes.length === 0 ) {
		return dom.nodeName === 'BR' && dom;
	}

	return firstElementIsBreakline( dom.firstChild );
}

function buildStrippedDom( content ) {
	// Spin up a new DOM for the linebreak markup
	const dom = domForHtml( content );

	// Ditch any photo captions, styles, scripts
	const stripSelectors =
		'.wp-caption, style, script, blockquote[class^="instagram-"], figure, .tiled-gallery';
	forEach( dom.querySelectorAll( stripSelectors ), removeElement );
	return dom.innerHTML;
}

export function formatExcerpt( content ) {
	if ( ! content ) {
		return '';
	}

	const dom = domForHtml( striptags( content, [ 'p', 'br', 'sup', 'sub' ] ) );
	dom.id = '__better_excerpt__';

	// strip any p's that are empty
	toArray( dom.querySelectorAll( 'p' ) )
		.filter( ( element ) => trim( element.textContent ).length === 0 )
		.forEach( removeElement );

	// remove styles for all p's that remain
	toArray( dom.querySelectorAll( 'p' ) ).forEach( ( element ) => {
		element.removeAttribute( 'style' );
		element.removeAttribute( 'align' );
	} );

	stripLeadingBreaklines( dom );

	// now limit it to the first three elements
	forEach( dom.querySelectorAll( '#__better_excerpt__ > p, #__better_excerpt__ > br' ), function (
		element,
		index
	) {
		if ( index >= 3 ) {
			element.parentNode && element.parentNode.removeChild( element );
		}
	} );

	// trim and replace &nbsp; entities
	const betterExcerpt = trim( dom.innerHTML.replace( /&nbsp;/g, ' ' ) );
	dom.innerHTML = '';
	return betterExcerpt;
}

export default function createBetterExcerpt( post ) {
	if ( ! post || ! post.content ) {
		return post;
	}

	const strippedDom = buildStrippedDom( post.content );

	post.content_no_html = trim( striptags( strippedDom ) );

	post.better_excerpt = formatExcerpt( strippedDom );
	post.better_excerpt_no_html = trim( striptags( post.better_excerpt ) );

	// also make a shorter excerpt...
	if ( post.better_excerpt_no_html ) {
		// replace any trailing [...] with an actual ellipsis
		let shorterExcerpt = post.better_excerpt_no_html.replace( /\[...\]\w*$/, '…' );
		// limit to 160 characters
		if ( shorterExcerpt.length > 160 ) {
			const lastSpace = shorterExcerpt.lastIndexOf( ' ', 160 );
			shorterExcerpt = shorterExcerpt.substring( 0, lastSpace ) + '…';
		}
		post.short_excerpt = shorterExcerpt;
	}

	return post;
}
