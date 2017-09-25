/**
 * External dependencies
 */
import { forEach } from 'lodash';

export default function removeContentStyles( post, dom ) {
	if ( ! dom ) {
		throw new Error( 'this transform must be used as part of withContentDOM' );
	}

	// Whitelist the markup for galleries, Instagram, and Twitter. Styling will be allowed on elements that match this selector.
	const whitelistSelector = '.gallery, .gallery *, .gallery-row, .gallery-row *, .gallery-group, .gallery-group *, ' +
	'blockquote[class^="instagram-"], blockquote[class^="instagram-"] *, ' +
	'blockquote[class^="twitter-"], blockquote[class^="twitter-"] *';

	// remove most style attributes
	const styled = dom.querySelectorAll( '[style]' );
	forEach( styled, function( element ) {
		if ( ! element.matches( whitelistSelector ) ) {
			element.removeAttribute( 'style' );
		}
	} );

	// remove all style elements outside of galleries and embeds
	forEach( dom.querySelectorAll( 'style' ), function( element ) {
		if ( ! element.matches( whitelistSelector ) ) {
			element.parentNode && element.parentNode.removeChild( element );
		}
	} );

	// remove align from non images. Unlike above, img align is permitted anywhere.
	forEach( dom.querySelectorAll( '[align]' ), element => {
		if ( element.tagName !== 'IMG' ) {
			element.removeAttribute( 'align' );
		}
	} );

	return post;
}
