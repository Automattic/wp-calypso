/**
 * Internal dependencies
 */
import {
	JETPACK_SETTINGS_REQUEST,
	JETPACK_SETTINGS_SAVE,
	JETPACK_SETTINGS_SAVE_SUCCESS,
	JETPACK_SETTINGS_UPDATE,
} from 'state/action-types';

import 'state/data-layer/wpcom/jetpack/settings';

export const requestJetpackSettings = ( siteId, query ) => ( {
	type: JETPACK_SETTINGS_REQUEST,
	siteId,
	query,
	meta: {
		dataLayer: {
			trackRequest: true,
		},
	},
} );

export const saveJetpackSettings = ( siteId, settings ) => ( {
	type: JETPACK_SETTINGS_SAVE,
	siteId,
	settings,
	meta: {
		dataLayer: {
			trackRequest: true,
		},
	},
} );

export const saveJetpackSettingsSuccess = ( siteId, settings ) => ( {
	type: JETPACK_SETTINGS_SAVE_SUCCESS,
	siteId,
	settings,
} );

export const updateJetpackSettings = ( siteId, settings ) => ( {
	type: JETPACK_SETTINGS_UPDATE,
	siteId,
	settings,
} );

/**
 * Regenerate the target email of Post by Email.
 *
 * @param  {Int}     siteId  ID of the site.
 * @returns {object}          Action object to regenerate the email when dispatched.
 */
export const regeneratePostByEmail = ( siteId ) =>
	saveJetpackSettings( siteId, { post_by_email_address: 'regenerate' } );
