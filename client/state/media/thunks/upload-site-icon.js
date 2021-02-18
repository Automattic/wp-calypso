/**
 * Internal dependencies
 */
import { saveSiteSettings, updateSiteSettings } from 'calypso/state/site-settings/actions';
import { errorNotice } from 'calypso/state/notices/actions';
import { addMedia } from 'calypso/state/media/thunks/add-media';
import { createTransientMediaId } from 'calypso/lib/media/utils';

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
	const transientMediaId = createTransientMediaId( 'site-icon' );

	const file = {
		ID: transientMediaId,
		fileContents: blob,
		fileName,
	};

	dispatch( updateSiteIcon( siteId, transientMediaId ) );
	try {
		const [ { ID: savedId } ] = await dispatch( addMedia( file, site ) );
		dispatch( saveSiteSettings( siteId, { site_icon: savedId } ) );
	} catch ( e ) {
		dispatch( errorNotice( translate( 'An error occurred while uploading the file.' ) ) );
		if ( originalSiteIconId ) {
			dispatch( updateSiteIcon( siteId, originalSiteIconId ) );
		}
	}
};
