/**
 * External Dependencies
 */
import {
	filter,
	find,
	flow,
	forEach,
	map,
	pull,
	take,
} from 'lodash';

/**
 * Internal Dependencies
 */
import { deduceImageWidthAndHeight, thumbIsLikelyImage } from './utils';
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:post-normalizer:wait-for-images-to-load' );

function convertImageToObject( image ) {
	return {
		src: image.src,
		// use natural height and width
		width: image.naturalWidth,
		height: image.naturalHeight
	};
}

function imageForURL( imageUrl ) {
	const img = new Image();
	img.src = imageUrl;
	return img;
}

function promiseForImage( image ) {
	if ( image.complete && image.naturalWidth > 0 ) {
		return Promise.resolve( image );
	}
	return new Promise( ( resolve, reject ) => {
		image.onload = () => resolve( image );
		image.onerror = () => reject( image );
	} );
}

const promiseForURL = flow( imageForURL, promiseForImage );

export default function waitForImagesToLoad( post ) {
	return new Promise( ( resolve ) => {
		function acceptLoadedImages( images ) {
			if ( post.featured_image ) {
				if ( ! find( images, { src: post.featured_image } ) ) {
					// featured image didn't load, nix it
					post.featured_image = null;
				}
			}

			post.images = map( images, convertImageToObject );

			post.content_images = filter( map( post.content_images, function( image ) {
				return find( post.images, { src: image.src } );
			} ), Boolean );

			// this adds adds height/width to images
			post.content_media = map( post.content_media, ( media ) => {
				if ( media.mediaType === 'image' ) {
					const img = find( post.images, { src: media.src } );
					return { ...media, ...img };
				}
				return media;
			} );

			resolve( post );
		}

		const imagesToCheck = [];

		if ( thumbIsLikelyImage( post.post_thumbnail ) ) {
			imagesToCheck.push( post.post_thumbnail.URL );
		} else if ( post.featured_image ) {
			imagesToCheck.push( post.featured_image );
		}

		const knownImages = {};

		forEach( post.content_images, function( image ) {
			const knownDimensions = deduceImageWidthAndHeight( image );
			if ( knownDimensions ) {
				knownImages[ image.src ] = {
					src: image.src,
					naturalWidth: knownDimensions.width,
					naturalHeight: knownDimensions.height
				};
			}
			imagesToCheck.push( image.src );
		} );

		if ( imagesToCheck.length === 0 ) {
			resolve( post );
			return;
		}

		const imagesLoaded = {};

		// convert to image objects to start the load process
		// only check the first 5 images
		let promises = map( take( imagesToCheck, 5 ), ( imageUrl ) => {
			if ( imageUrl in knownImages ) {
				return Promise.resolve( knownImages[ imageUrl ] );
			}
			return promiseForURL( imageUrl );
		} );

		forEach( promises, promise => {
			promise.then( image => {
				// keep track of what loaded successfully. Note these will be out of order.
				imagesLoaded[ image.src ] = image;
			} ).catch( err => {
				// ignore what did not, but return the promise chain to success
				debug( 'failed to load image', err, post );
				return null;
			} ).then( () => {
				// check to see if all of the promises have settled
				// if so, accept what loaded and resolve the main promise
				promises = pull( promises, promise );
				if ( promises.length === 0 ) {
					const imagesInOrder = filter( map( imagesToCheck, src => {
						return imagesLoaded[ src ];
					} ), Boolean );
					acceptLoadedImages( imagesInOrder );
				}
			} ).catch( err => {
				debug( 'Fulfilling promise failed', err );
			} );
		} );
	} );
}
