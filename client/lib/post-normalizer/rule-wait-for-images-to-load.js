/**
 * External dependencies
 */

import { filter, find, flow, forEach, map, pull, take } from 'lodash';

/**
 * Internal Dependencies
 */
import { deduceImageWidthAndHeight, thumbIsLikelyImage } from './utils';
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:post-normalizer:wait-for-images-to-load' );

function convertImageToObject( image ) {
	const returnObj = {
		src: image.src,
		// use natural height and width
		width: image.naturalWidth,
		height: image.naturalHeight,
	};

	if ( image instanceof Image && image.complete ) {
		returnObj.fetched = true;
	}

	return returnObj;
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

			post.content_images = filter(
				map( post.content_images, function ( image ) {
					return find( post.images, { src: image.src } );
				} ),
				Boolean
			);

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

		const knownImages = {};
		const imagesToCheck = [];

		function checkAndRememberDimensions( image, url ) {
			// Check provided image (if any) for dimension info first.
			let knownDimensions = image && deduceImageWidthAndHeight( image );

			// If we still don't know the dimension info, check attachments.
			if ( ! knownDimensions && post.attachments ) {
				const attachment = Object.values( post.attachments ).find(
					( att ) => att.URL === post.featured_image
				);
				if ( attachment ) {
					knownDimensions = deduceImageWidthAndHeight( attachment );
				}
			}

			// Remember dimensions if we have them.
			if ( knownDimensions ) {
				knownImages[ url ] = {
					src: url,
					naturalWidth: knownDimensions.width,
					naturalHeight: knownDimensions.height,
				};
			}
			imagesToCheck.push( url );
		}

		if ( thumbIsLikelyImage( post.post_thumbnail ) ) {
			checkAndRememberDimensions( post.post_thumbnail, post.post_thumbnail.URL );
		} else if ( post.featured_image ) {
			checkAndRememberDimensions( null, post.featured_image );
		}

		forEach( post.content_images, ( image ) => checkAndRememberDimensions( image, image.src ) );

		if ( imagesToCheck.length === 0 ) {
			resolve( post );
			return;
		}

		const imagesLoaded = {};

		// convert to image objects to start the load process
		// only check the first x images
		const NUMBER_OF_IMAGES_TO_CHECK = 10;
		let promises = map( take( imagesToCheck, NUMBER_OF_IMAGES_TO_CHECK ), ( imageUrl ) => {
			if ( imageUrl in knownImages ) {
				return Promise.resolve( knownImages[ imageUrl ] );
			}
			return promiseForURL( imageUrl );
		} );

		forEach( promises, ( promise ) => {
			promise
				.then( ( image ) => {
					// keep track of what loaded successfully. Note these will be out of order.
					imagesLoaded[ image.src ] = image;
				} )
				.catch( ( err ) => {
					// ignore what did not, but return the promise chain to success
					debug( 'failed to load image', err, post );
					return null;
				} )
				.then( () => {
					// check to see if all of the promises have settled
					// if so, accept what loaded and resolve the main promise
					promises = pull( promises, promise );
					if ( promises.length === 0 ) {
						const imagesInOrder = filter(
							map( imagesToCheck, ( src ) => {
								return imagesLoaded[ src ];
							} ),
							Boolean
						);
						acceptLoadedImages( imagesInOrder );
					}
				} )
				.catch( ( err ) => {
					debug( 'Fulfilling promise failed', err );
				} );
		} );
	} );
}
