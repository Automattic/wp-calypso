/**
 * External dependencies
 */
import uniqueId from 'lodash/uniqueId';

/**
 * Internal dependencies
 */
import { createTransientMedia, getFileUploader, validateMediaItem } from 'lib/media/utils';
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
import { saveSiteSettings, updateSiteSettings } from 'state/site-settings/actions';
import { errorNotice } from 'state/notices/actions';

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
 * @param {object} site The site to add the media to
 * @param {object} file The file to upload
 * @param {string?} transientDate Date for the transient item
 * @returns {import('redux-thunk').ThunkAction<Promise<object>, any, any, any>} A thunk resolving with the uploaded media item
 */
export const addMedia = ( site, file, transientDate = getTransientDate() ) => async (
	dispatch,
	getState
) => {
	const uploader = getFileUploader( getState(), site, file );

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

		dispatchFluxReceiveMediaItemSuccess( transientMedia.ID, siteId, uploadedMedia );

		dispatch( successMediaItemRequest( siteId, transientMedia.ID ) );
		dispatch(
			receiveMedia(
				siteId,
				{
					...uploadedMedia,
					transientId: transientMedia.ID,
				},
				found
			)
		);

		dispatchFluxFetchMediaLimits( siteId );

		return uploadedMedia;
	} catch ( error ) {
		dispatchFluxReceiveMediaItemError( transientMedia.ID, siteId, error );

		dispatch( failMediaItemRequest( siteId, transientMedia.ID, error ) );
		// no need to dispatch `deleteMedia` as `createMediaItem` won't have added it to the MediaQueryManager which tracks instances.
		// rethrow so consumers know the upload failed
		throw error;
	}
};

const updateSiteIcon = ( siteId, mediaId ) => updateSiteSettings( siteId, { site_icon: mediaId } );

/**
 * Upload a new site icon. Used when a new file is uploaded via the media modal or when an existing
 * file is cropped. This function also handles resetting the previous site icon in the case of a failure
 * when a previous site icon ID is provided.
 *
 * @param {object} blob The file to use as the site icon.
 * @param {string} fileName The filename for the new site icon.
 * @param {number} siteId The site ID.
 * @param {(string) => string} translate Translate function supplied by `localize` HOC.
 * @param {(number|string)?} originalSiteIconId The existing site icon's ID if one is set.
 * @param {object} site The site.
 * @returns {require('redux-thunk').ThunkAction<Promise<void>, any, any any>} A thunk resolving when the media is successfully uploaded
 */
export const uploadSiteIcon = (
	blob,
	fileName,
	siteId,
	translate,
	originalSiteIconId,
	site
) => async ( dispatch ) => {
	// Upload media using a manually generated ID so that we can continue
	// to reference it within this function
	const transientMediaId = uniqueId( 'site-icon' );
	const file = {
		ID: transientMediaId,
		fileContents: blob,
		fileName,
	};

	dispatch( updateSiteIcon( siteId, transientMediaId ) );
	try {
		const { ID: savedId } = await dispatch( addMedia( site, file ) );
		dispatch( saveSiteSettings( siteId, { site_icon: savedId } ) );
	} catch ( e ) {
		dispatch( errorNotice( translate( 'An error occurred while uploading the file.' ) ) );
		if ( originalSiteIconId ) {
			dispatch( updateSiteIcon( siteId, originalSiteIconId ) );
		}
	}
};
