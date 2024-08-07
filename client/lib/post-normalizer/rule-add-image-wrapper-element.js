import { forEach } from 'lodash';

/**
 * Gets the image width and height from an img attribute
 * We can get the aspect ratio with the width and height
 * With the ratio, return a class to help with displaying images within aspect ratio ranges
 * @param  {Object} image - the img element
 * @returns string
 */
const getImageAspectRatioClass = ( image ) => {
	let sizes = image.getAttribute( 'data-orig-size' ) || '';
	if ( sizes.length === 0 ) {
		return '';
	}

	sizes = sizes.split( ',' );
	const imageWidth = parseInt( sizes[ 0 ] ?? 0 );
	const imageHeight = parseInt( sizes[ 1 ] ?? 0 );

	if ( imageWidth === 0 ) {
		return '';
	}

	if ( imageHeight === 0 ) {
		return '';
	}

	const ratio = parseFloat( imageWidth / imageHeight );
	if ( ratio === 1.0 ) {
		return 'square';
	} else if ( ratio > 0 && ratio < 9 / 16 ) {
		return 'tall';
	} else if ( ratio >= 9 / 16 && ratio < 2 / 3 ) {
		return 'nine-sixteen';
	} else if ( ratio >= 2 / 3 && ratio < 4 / 5 ) {
		return 'two-three';
	} else if ( ratio >= 4 / 5 && ratio < 1 ) {
		return 'four-five';
	} else if ( ratio > 1 && ratio <= 5 / 4 ) {
		return 'five-four';
	} else if ( ratio > 5 / 4 && ratio <= 3 / 2 ) {
		return 'three-two';
	} else if ( ratio > 3 / 2 && ratio <= 16 / 9 ) {
		return 'sixteen-nine';
	} else if ( ratio > 16 / 9 ) {
		return 'wide';
	}

	// Not sure we can get here but...
	return '';
};

/**
 * Gets the current image width (rather than original width)
 * Checks the image width attribute
 * Checks if width set in img src URL query params, i.e. {image-url}?w={width}
 * Returns 0 if no current width found
 * @param image
 * @returns {number}
 */
const getCurrentImageWidth = ( image ) => {
	let width = image.width || 0;

	if ( width === 0 && image.src !== undefined ) {
		// Parse width from src
		const params = image.src.split( '?' )[ 1 ];
		if ( params !== undefined ) {
			const searchParams = new URLSearchParams( params );
			width = searchParams.get( 'w' ) || '0';
		}
	}

	return parseInt( width );
};

export default function addImageWrapperElement( post, dom ) {
	if ( ! dom ) {
		throw new Error( 'this transform must be used as part of withContentDOM' );
	}

	const images = dom.querySelectorAll( 'img[src]' );
	forEach( images, ( image ) => {
		if ( image.classList.contains( 'wp-smiley' ) || image.classList.contains( 'emoji' ) ) {
			// filter images that have the class wp-smiley or emoji
			// these are emoji images and should not be wrapped
			return;
		}
		// Add container wrapper for img elements
		const parent = image.parentNode;
		const imageWrapper = document.createElement( 'div' );
		const aspectRatioClass = getImageAspectRatioClass( image );
		imageWrapper.className = 'image-wrapper ' + aspectRatioClass;
		// set the wrapper as child (instead of the element)
		parent.replaceChild( imageWrapper, image );
		// set element as child of wrapper
		imageWrapper.appendChild( image );

		// Add div to allow image border with an inset box-shadow
		const imageWidth = getCurrentImageWidth( image );
		if ( imageWidth > 0 ) {
			const imageBorder = document.createElement( 'div' );
			const borderStyle = document.createAttribute( 'style' );
			imageBorder.className = 'image-border';
			borderStyle.value = 'width: ' + imageWidth + 'px';
			imageBorder.setAttributeNode( borderStyle );
			imageWrapper.appendChild( imageBorder );
		}
	} );

	return post;
}
