import { safeImageUrl } from '@automattic/calypso-url';
import { filter } from 'lodash';

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
