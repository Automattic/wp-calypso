import { forEach } from 'lodash';

export default function addImageWrapperElement( post, dom ) {
	if ( ! dom ) {
		throw new Error( 'this transform must be used as part of withContentDOM' );
	}

	const images = dom.querySelectorAll( 'img[src]' );
	forEach( images, ( image ) => {
		// Add container wrapper for img elements
		const parent = image.parentNode;
		const imageWrapper = document.createElement( 'div' );
		imageWrapper.className = 'image-wrapper';
		// set the wrapper as child (instead of the element)
		parent.replaceChild( imageWrapper, image );
		// set element as child of wrapper
		imageWrapper.appendChild( image );
	} );

	return post;
}
