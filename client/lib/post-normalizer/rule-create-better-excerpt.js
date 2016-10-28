/**
 * External Dependencies
 */
import forEach from 'lodash/forEach';
import striptags from 'striptags';
import trim from 'lodash/trim';

/**
 * Internal Dependencies
 */
import { domForHtml } from './utils';
import { stripHTML } from 'lib/formatting';

export function formatExcerpt( content ) {
	if ( ! content ) {
		return '';
	}

	function removeElement( element ) {
		element.parentNode && element.parentNode.removeChild( element );
	}

	// Spin up a new DOM for the linebreak markup
	const dom = domForHtml( content );
	dom.id = '__better_excerpt__';
	dom.innerHTML = content;

	// Ditch any photo captions with the wp-caption-text class, styles, scripts
	forEach( dom.querySelectorAll( '.wp-caption-text, style, script, blockquote[class^="instagram-"], figure' ), removeElement );

	// limit to paras and brs
	dom.innerHTML = striptags( dom.innerHTML, [ 'p', 'br' ] );

	// Strip any empty p and br elements from the beginning of the content
	forEach( dom.querySelectorAll( 'p,br' ), function( element ) {
		// is this element non-empty? bail on our iteration.
		if ( element.childNodes.length > 0 && trim( element.textContent ).length > 0 ) {
			return false;
		}
		element.parentNode && element.parentNode.removeChild( element );
	} );

	// now strip any p's that are empty and remove styles
	forEach( dom.querySelectorAll( 'p' ), function( element ) {
		if ( trim( element.textContent ).length === 0 ) {
			element.parentNode && element.parentNode.removeChild( element );
		} else {
			element.removeAttribute( 'style' );
		}
	} );

	// now limit it to the first three elements
	forEach( dom.querySelectorAll( '#__better_excerpt__ > p, #__better_excerpt__ > br' ), function( element, index ) {
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

	post.better_excerpt = formatExcerpt( post.content );
	post.better_excerpt_no_html = stripHTML( post.better_excerpt );

	// also make a shorter excerpt...
	if ( post.better_excerpt ) {
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
