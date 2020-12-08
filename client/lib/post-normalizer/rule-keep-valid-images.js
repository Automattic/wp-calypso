/**
 * External dependencies
 */
import { filter } from 'lodash';

/**
 * Internal dependencies
 */
import safeImageUrl from 'calypso/lib/safe-image-url';

function isValidImage( width, height ) {
	return function ( image ) {
		return image.width >= width && image.height >= height && safeImageUrl( image.src );
	};
}

export default function keepValidImages( minWidth, minHeight ) {
	return function keepValidImagesForWidthAndHeight( post ) {
		const imageFilter = isValidImage( minWidth, minHeight );
		if ( post.images ) {
			post.images = filter( post.images, imageFilter );
		}
		if ( post.content_images ) {
			post.content_images = filter( post.content_images, imageFilter );
		}
		return post;
	};
}
