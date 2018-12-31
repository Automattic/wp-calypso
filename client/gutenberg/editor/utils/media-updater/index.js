/** @format */

/**
 * External dependencies
 */
import { dispatch, select } from '@wordpress/data';
import { debounce, partialRight } from 'lodash';

/**
 * Internal dependencies
 */
import MediaStore from 'lib/media/store';

const { updateBlockAttributes } = dispatch( 'core/editor' );
const { getBlocks } = select( 'core/editor' );

/**
 * Update the previewed media on the post after changing it on the Media Modal
 */
class MediaUpdater {
	siteId = null;

	constructor( siteId ) {
		this.siteId = siteId;
		MediaStore.on( 'change', () => {
			this.updateMediaBlocks( getBlocks() );
		} );
	}

	/**
	 * Update the media of the blocks rendering an edited image
	 * @param {Array} blocks Array of block objects for the current post being edited
	 */
	updateMediaBlocks = debounce( blocks => {
		blocks.forEach( block => {
			if ( this.mediaBocks[ block.name ] ) {
				this.mediaBocks[ block.name ]( block );
			}

			if ( block.innerBlocks.length ) {
				this.updateMediaBlocks( block.innerBlocks );
			}
		} );
	} );

	/**
	 * Preload an image given its URL so it can be rendered without flickering
	 * @param {String} imageUrl URL of the image to preload
	 * @returns {Promise} Promises that resolves when the image is preloaded
	 */
	preloadImage = imageUrl =>
		new Promise( ( resolve, reject ) => {
			const preloadImage = new Image();
			preloadImage.src = imageUrl;
			preloadImage.onload = resolve;
			preloadImage.onerror = reject;
		} );

	/**
	 * Update the block attribute storing a single image URL
	 * @param {Object} block Block to update
	 * @param {Object} attrNames Mapping defining the name of the attributes to update
	 */
	updateSingeImageBlock = async ( block, attrNames = {} ) => {
		attrNames = {
			id: 'id',
			url: 'url',
			...attrNames,
		};

		const { id, url } = attrNames;
		const { siteId } = this;
		const { clientId, attributes } = block;

		const media = MediaStore.get( siteId, attributes[ id ] );

		if ( media ) {
			// If image was deleted in the Media Modal, we delete it in the block.
			if ( media.status === 'deleted' || ! media.URL ) {
				updateBlockAttributes( clientId, {
					[ id ]: undefined,
					[ url ]: undefined,
				} );
			} else {
				// To avoid an undesirable flicker when the image hasn't yet been loaded,
				// we preload the image before rendering.
				await this.preloadImage( media.URL );

				updateBlockAttributes( clientId, { [ url ]: media.URL } );
			}
		}
	};

	/**
	 * Update the block attribute storing a list of images
	 * @param {Object} block Block to update
	 * @param {Object} attrNames Mapping defining the name of the attributes to update
	 */
	updateMultipleImagesBlock = async ( block, attrNames = {} ) => {
		attrNames = {
			images: 'images',
			id: 'id',
			url: 'url',
			...attrNames,
		};

		const { images, id, url } = attrNames;
		const { siteId } = this;
		const { clientId, attributes } = block;

		const currentImages = attributes[ images ];
		const updatedImages = [];

		for ( const image of currentImages ) {
			const media = MediaStore.get( siteId, image[ id ] );

			// Deleted images are not included in the new images attribute so
			// they are removed from the block.
			if ( media && media.status !== 'deleted' && media.URL ) {
				// To avoid an undesirable flicker when the image hasn't yet been loaded,
				// we preload the image before rendering.
				await this.preloadImage( media.URL );

				updatedImages.push( {
					...image,
					[ url ]: media.URL,
				} );
			}
		}

		updateBlockAttributes( clientId, { [ images ]: updatedImages } );
	};

	// Block name -> Function that updates the media
	mediaBocks = {
		'core/cover': this.updateSingeImageBlock,
		'core/image': this.updateSingeImageBlock,
		'core/file': partialRight( this.updateSingeImageBlock, { url: 'href' } ),
		'core/gallery': this.updateMultipleImagesBlock,
		'core/media-text': partialRight( this.updateSingeImageBlock, {
			id: 'mediaId',
			url: 'mediaUrl',
		} ),
		'jetpack/tiled-gallery': this.updateMultipleImagesBlock,
	};
}

export default siteId => new MediaUpdater( siteId );
