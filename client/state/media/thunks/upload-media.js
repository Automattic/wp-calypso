/**
 * External dependencies
 */
import { castArray, noop, zip } from 'lodash';

/**
 * Internal dependencies
 */
import {
	receiveMedia,
	successMediaItemRequest,
	failMediaItemRequest,
} from 'calypso/state/media/actions';
import { requestMediaStorage } from 'calypso/state/sites/media-storage/actions';
import { createTransientMediaItems } from 'calypso/state/media/thunks/create-transient-media-items';
import { isFileList } from 'calypso/state/media/utils/is-file-list';

/**
 * Add media items serially (one at a time) but dispatch creation
 * for all at the start. Use a safe default for when
 * only a single item is being uploaded.
 *
 * This function swallows errors and behaves differently from a Promise.all.
 * Where Promise.all will fail on a single failed promise, this function
 * swallows all errors and depends on the `onItemFailure` and redux store's
 * handling of errors. It then returns only the list of successful uploads.
 *
 * Note: Temporarily this action will dispatch to the flux store, until
 * the flux store is removed.
 *
 * @param {object|object[]} files The file to upload
 * @param {object} site The site to add the media to
 * @param {Function} uploader The file uploader to use
 * @param {Function?} onItemUploaded Optional function to call when upload for an individual item succeeds
 * @param {Function?} onItemFailure Optional function to be called when upload for an individual item fails
 * @returns {import('redux-thunk').ThunkAction<Promise<object[]>, any, any, any>} A thunk resolving
 * with the uploaded media items.
 */
export const uploadMedia = (
	files,
	site,
	uploader,
	onItemUploaded = noop,
	onItemFailure = noop
) => async ( dispatch ) => {
	// https://stackoverflow.com/questions/25333488/why-isnt-the-filelist-object-an-array
	files = isFileList( files ) ? Array.from( files ) : castArray( files );
	const uploadedItems = [];

	const transientItems = dispatch( createTransientMediaItems( files, site ) );
	const { ID: siteId } = site;

	await zip( files, transientItems ).reduce( async ( previousUpload, [ file, transientMedia ] ) => {
		if ( ! transientMedia ) {
			// there was an error creating the transient media so just move on to the next one
			return previousUpload;
		}

		await previousUpload;

		try {
			const {
				media: [ uploadedMedia ],
				found,
			} = await uploader( file, siteId );
			const uploadedMediaWithTransientId = {
				...uploadedMedia,
				transientId: transientMedia.ID,
			};

			dispatch( successMediaItemRequest( siteId, transientMedia.ID ) );
			dispatch( receiveMedia( siteId, uploadedMediaWithTransientId, found ) );

			dispatch( requestMediaStorage( siteId ) );

			onItemUploaded( uploadedMediaWithTransientId, file );
			uploadedItems.push( uploadedMediaWithTransientId );
		} catch ( error ) {
			dispatch( failMediaItemRequest( siteId, transientMedia.ID, error ) );
			onItemFailure( file );
		}
	}, Promise.resolve() );

	return uploadedItems;
};
