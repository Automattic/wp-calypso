/**
 * External Dependencies
 */
import forEach from 'lodash/forEach';
import striptags from 'striptags';
import trim from 'lodash/trim';

/**
 * Internal Dependencies
 */

export default function createBetterExcerpt( post ) {
	if ( ! post || ! post.content ) {
		return post;
	}

	function removeElement( element ) {
		element.parentNode && element.parentNode.removeChild( element );
	}

	// Spin up a new DOM for the linebreak markup
	let dom;
	if ( typeof DOMParser !== 'undefined' && DOMParser.prototype.parseFromString ) {
		const parser = new DOMParser();
		dom = parser.parseFromString( post.content, 'text/html' ).body;
	} else {
		dom = document.createElement( 'div' );
		dom.innerHTML = post.content;
	}
	dom.id = '__better_excerpt__';
	dom.innerHTML = post.content;

	// Ditch any photo captions with the wp-caption-text class, styles, scripts
	forEach( dom.querySelectorAll( '.wp-caption-text, style, script' ), removeElement );

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

	// now strip any p's that are empty
	forEach( dom.querySelectorAll( 'p' ), function( element ) {
		if ( trim( element.textContent ).length === 0 ) {
			element.parentNode && element.parentNode.removeChild( element );
		}
	} );

	// now limit it to the first three elements
	forEach( dom.querySelectorAll( '#__better_excerpt__ > p, #__better_excerpt__ > br' ), function( element, index ) {
		if ( index >= 3 ) {
			element.parentNode && element.parentNode.removeChild( element );
		}
	} );

	post.better_excerpt = trim( dom.innerHTML );
	dom.innerHTML = '';

	return post;
}
