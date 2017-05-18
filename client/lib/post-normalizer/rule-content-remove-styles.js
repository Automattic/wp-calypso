/**
 * External Dependencies
 */
import { forEach } from 'lodash';

export default function removeContentStyles( post, dom ) {
	if ( ! dom ) {
		throw new Error( 'this transform must be used as part of withContentDOM' );
	}

	// if there are any specials in the post, skip it
	if ( dom.querySelector( '.gallery, .tiled-gallery, blockquote[class^="instagram-"], blockquote[class^="twitter-"]' ) ) {
		return post;
	}

	// remove most style attributes
	const styled = dom.querySelectorAll( '[style]' );
	forEach( styled, function( element ) {
		element.removeAttribute( 'style' );
	} );

	// remove all style elements
	forEach( dom.querySelectorAll( 'style' ), function( element ) {
		element.parentNode && element.parentNode.removeChild( element );
	} );

	// remove align from non images
	forEach( dom.querySelectorAll( '[align]' ), element => {
		if ( element.tagName !== 'IMG' ) {
			element.removeAttribute( 'align' );
		}
	} );

	return post;
}
