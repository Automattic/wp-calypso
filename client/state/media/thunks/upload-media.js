/**
 * Internal dependencies
 */
import { createTransientMedia, validateMediaItem } from 'lib/media/utils';
import { getTransientDate } from 'state/media/utils/transient-date';
import {
	dispatchFluxCreateMediaItem,
	dispatchFluxFetchMediaLimits,
	dispatchFluxReceiveMediaItemError,
	dispatchFluxReceiveMediaItemSuccess,
} from 'state/media/utils/flux-adapter';
import {
	createMediaItem,
	receiveMedia,
	successMediaItemRequest,
	failMediaItemRequest,
	setMediaItemErrors,
} from 'state/media/actions';
import { serially } from 'state/media/thunks/serially';

/**
 * Add a single media item. Allow passing in the transient date so
 * that consumers can upload in series. Use a safe default for when
 * only a single item is being uploaded.
 *
 * Restrict this function to purely a single media item.
 *
 * Note: Temporarily this action will dispatch to the flux store, until
 * the flux store is removed.
 *
 * @param {object} file The file to upload
 * @param {object} site The site to add the media to
 * @param {Function} uploader The file uploader to use
 * @param {string?} transientDate Date for the transient item
 * @returns {import('redux-thunk').ThunkAction<Promise<object>, any, any, any>} A thunk resolving with the uploaded media item
 */
export const uploadSingleMedia = (
	file,
	site,
	uploader,
	transientDate = getTransientDate()
) => async ( dispatch ) => {
	const transientMedia = {
		date: transientDate,
		...createTransientMedia( file ),
	};

	if ( file.ID ) {
		transientMedia.ID = file.ID;
	}

	const { ID: siteId } = site;

	dispatchFluxCreateMediaItem( transientMedia, site );

	const errors = validateMediaItem( site, transientMedia );
	if ( errors?.length ) {
		dispatch( setMediaItemErrors( siteId, transientMedia.ID, errors ) );
		// throw rather than silently escape so consumers know the upload failed based on Promise resolution rather than state having to re-derive the failure themselves from state
		throw errors;
	}

	dispatch( createMediaItem( site, transientMedia ) );

	try {
		const {
			media: [ uploadedMedia ],
			found,
		} = await uploader( file, siteId );

		const uploadedMediaWithTransientId = {
			...uploadedMedia,
			transientId: transientMedia.ID,
		};

		dispatchFluxReceiveMediaItemSuccess( transientMedia.ID, siteId, uploadedMedia );

		dispatch( successMediaItemRequest( siteId, transientMedia.ID ) );
		dispatch( receiveMedia( siteId, uploadedMediaWithTransientId, found ) );

		dispatchFluxFetchMediaLimits( siteId );

		return uploadedMediaWithTransientId;
	} catch ( error ) {
		dispatchFluxReceiveMediaItemError( transientMedia.ID, siteId, error );

		dispatch( failMediaItemRequest( siteId, transientMedia.ID, error ) );
		// no need to dispatch `deleteMedia` as `createMediaItem` won't have added it to the MediaQueryManager which tracks instances.
		// rethrow so consumers know the upload failed
		throw error;
	}
};

export const uploadMedia = serially( uploadSingleMedia );
