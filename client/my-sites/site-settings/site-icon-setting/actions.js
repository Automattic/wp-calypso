/**
 * External dependencies
 */
import uniqueId from 'lodash/uniqueId';

/**
 * Internal dependencies
 */
import { addMedia } from 'state/media/actions';
import { saveSiteSettings, updateSiteSettings } from 'state/site-settings/actions';
import { errorNotice } from 'state/notices/actions';

const updateSiteIcon = ( siteId, mediaId ) => updateSiteSettings( siteId, { site_icon: mediaId } );

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
		saveSiteSettings( siteId, { site_icon: savedId } );
	} catch ( e ) {
		dispatch( errorNotice( translate( 'An error occurred while uploading the file.' ) ) );
		if ( originalSiteIconId ) {
			dispatch( updateSiteIcon( siteId, originalSiteIconId ) );
		}
	}
};
