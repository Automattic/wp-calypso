import { forEach } from 'lodash';

function matches( element, selector ) {
	const ep = Element.prototype;
	// modern browsers support `matches` but IE11 and older safari support it as `matchesSelector` with a prefix
	const matcher =
		ep.matches || ep.webkitMatchesSelector || ep.mozMatchesSelector || ep.msMatchesSelector;
	if ( ! matcher ) {
		return false;
	}
	return matcher.call( element, selector );
}

export default function removeContentStyles( post, dom ) {
	if ( ! dom ) {
		throw new Error( 'this transform must be used as part of withContentDOM' );
	}

	// Styling will be allowed on elements that match this selector.
	const allowedMarkupSelector =
		// Inline highlighted text
		'mark.has-inline-color, ' +
		// Gallery
		'.gallery, .gallery *, .gallery-row, .gallery-row *, .gallery-group, .gallery-group *, ' +
		// Instagram
		'blockquote[class^="instagram-"], blockquote[class^="instagram-"] *, ' +
		// Twitter
		'blockquote[class^="twitter-"], blockquote[class^="twitter-"] *';

	// remove most style attributes
	const styled = dom.querySelectorAll( '[style]' );
	forEach( styled, function ( element ) {
		if ( ! matches( element, allowedMarkupSelector ) ) {
			element.removeAttribute( 'style' );
		}
	} );

	// remove all style elements outside of galleries and embeds
	forEach( dom.querySelectorAll( 'style' ), function ( element ) {
		if ( ! matches( element, allowedMarkupSelector ) ) {
			element.parentNode && element.parentNode.removeChild( element );
		}
	} );

	// remove align from non images. Unlike above, img align is permitted anywhere.
	forEach( dom.querySelectorAll( '[align]' ), ( element ) => {
		if ( element.tagName !== 'IMG' ) {
			element.removeAttribute( 'align' );
		}
	} );

	return post;
}
