/** @format */

/**
 * External dependencies
 */
import { dispatch, select } from '@wordpress/data';
import { partialRight } from 'lodash';

/**
 * Internal dependencies
 */
import MediaStore from 'lib/media/store';

const { updateBlockAttributes, editPost } = dispatch( 'core/editor' );
const { getBlocks, getEditedPostAttribute } = select( 'core/editor' );

/**
 * Update the previewed images on the post when they are edited within the Media Modal
 */
class EditedImagesUpdater {
	editedImages = [];

	constructor() {
		MediaStore.on( 'edit', items => {
			this.editedImages = items;
			this.updateBlocks( getBlocks() );
			this.updateFeaturedImage();
		} );
	}

	/**
	 * Update the images of the blocks rendering an edited image
	 * @param {Array} blocks Array of block objects for the current post being edited
	 */
	updateBlocks( blocks ) {
		blocks.forEach( block => {
			if ( this.blocksToUpdate[ block.name ] ) {
				this.blocksToUpdate[ block.name ]( block );
			}

			if ( block.innerBlocks.length ) {
				this.updateBlocks( block.innerBlocks );
			}
		} );
	}

	/**
	 * Update the featured image of the post if has been edited
	 */
	updateFeaturedImage() {
		const featuredImageId = getEditedPostAttribute( 'featured_media' );
		const editedImage = this.getEditedImage( featuredImageId );
		if ( editedImage ) {
			// Featured image is set in the state as an ID, so we need to reset it
			// in order to make the editor to retrieve it again
			editPost( { featured_media: 0 } );
			editPost( { featured_media: featuredImageId } );
		}
	}

	/**
	 * Get the edited image given an ID
	 * @param {number|string} id Identifier of thr requested image
	 * @returns {Object} The edited image
	 */
	getEditedImage = id =>
		this.editedImages.find( image => parseInt( image.ID, 10 ) === parseInt( id, 10 ) );

	/**
	 * Update the block attribute storing a single image URL
	 * @param {Object} block Block to update
	 * @param {String} urlAttrName Name of the URL attribute
	 * @param {String} idAttrName Name of the ID attribute
	 */
	updateSingeImageBlock = ( block, urlAttrName = 'url', idAttrName = 'id' ) => {
		const editedImage = this.getEditedImage( block.attributes[ idAttrName ] );
		if ( editedImage ) {
			updateBlockAttributes( block.clientId, { [ urlAttrName ]: editedImage.URL } );
		}
	};

	/**
	 * Update the block attribute storing a list of images
	 * @param {Object} block Block to update
	 * @param {String} imagesAttrName Name of the images attribute
	 * @param {String} urlAttrName Name of the URL attribute
	 * @param {String} idAttrName Name of the ID attribute
	 */
	updateMultipleImagesBlock = (
		block,
		imagesAttrName = 'images',
		urlAttrName = 'url',
		idAttrName = 'id'
	) => {
		const images = block.attributes[ imagesAttrName ];
		images.forEach( image => {
			const editedImage = this.getEditedImage( image[ idAttrName ] );
			if ( editedImage ) {
				image[ urlAttrName ] = editedImage.URL;
			}
		} );

		updateBlockAttributes( block.clientId, { [ imagesAttrName ]: images } );
	};

	/**
	 * Update the block attribute storing a single image ID
	 * @param {Object} block Block to update
	 * @param {String} idAttrName Name of the ID attribute
	 */
	updateIdSingleImageBlock = ( block, idAttrName = 'id' ) => {
		const id = block.attributes[ idAttrName ];
		const editedImage = this.getEditedImage( id );
		if ( editedImage ) {
			// We assume that the block will retrieve again the image when the
			// ID attribute is changed
			updateBlockAttributes( block.clientId, { [ idAttrName ]: 0 } );
			updateBlockAttributes( block.clientId, { [ idAttrName ]: id } );
		}
	};

	// Block name -> Function that update the image(s)
	blocksToUpdate = {
		'core/cover': this.updateSingeImageBlock,
		'core/image': this.updateSingeImageBlock,
		'core/file': partialRight( this.updateSingeImageBlock, 'href' ),
		'core/gallery': this.updateMultipleImagesBlock,
		'core/media-text': partialRight( this.updateSingeImageBlock, 'mediaUrl', 'mediaId' ),
		'jetpack/tiled-gallery': this.updateMultipleImagesBlock,
		'jetpack/simple-payments': partialRight( this.updateIdSingleImageBlock, 'featuredMediaId' ),
	};
}

export default () => new EditedImagesUpdater();
