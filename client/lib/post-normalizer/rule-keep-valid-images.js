/**
 * External dependencies
 */

import { filter } from 'lodash';

/**
 * Internal Dependencies
 */

function imageHasMinWidthAndHeight( width, height ) {
	return function ( image ) {
		return image.width >= width && image.height >= height;
	};
}

export default function keepValidImages( minWidth, minHeight ) {
	return function keepValidImagesForWidthAndHeight( post ) {
		const imageFilter = imageHasMinWidthAndHeight( minWidth, minHeight );
		if ( post.images ) {
			post.images = filter( post.images, imageFilter );
		}
		if ( post.content_images ) {
			post.content_images = filter( post.content_images, imageFilter );
		}
		return post;
	};
}
