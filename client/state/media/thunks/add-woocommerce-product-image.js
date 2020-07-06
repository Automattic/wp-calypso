/**
 * Internal dependencies
 */
import { addMedia } from './add-media';
import { serially } from './serially';

/**
 * Upload a list of woocommerce product images.
 *
 * The Woocommerce product image upload requires a few hooks different from the rest
 * of the media uploading cases so we're using a hybrid of the old-style callbacks
 * and async-await to get something that works.
 *
 * @param {object[]|object} files List of files or a single file to upload
 * @param {object} site The site object.
 * @param {(object) => void} onUpload Function to run on each item's upload
 * @param {(object) => void} onError Function to run if an item's upload fails
 * @param {(object) => void} onFinish Function to run when the uploading finishes
 */
export const addWoocommerceProductImage = ( files, site, onUpload, onError, onFinish ) => async (
	dispatch
) => {
	const add = serially(
		// `serially` assumes the action's arguments go file then extra args
		// but `addMedia` uses the old `site`,`file` pattern. Maybe we should
		// change everything to be `file(s)`, `site`?
		// @todo(saramarcondes) update addMedia signatures to all match order expected by serially
		addMedia,
		( uploadedMedia, originalFile ) =>
			onUpload( {
				ID: uploadedMedia.ID,
				transientId: originalFile.ID,
				URL: uploadedMedia.URL,
				placeholder: originalFile.preview,
			} ),
		onError
	);

	const uploadedItems = await dispatch( add( files, site ) );
	onFinish( uploadedItems.map( ( item ) => item.ID ) );
};
