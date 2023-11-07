import {
	JETPACK_SETTINGS_REQUEST,
	JETPACK_SETTINGS_SAVE,
	JETPACK_SETTINGS_SAVE_SUCCESS,
	JETPACK_SETTINGS_UPDATE,
	JETPACK_SETTINGS_CLONE,
	JETPACK_SETTINGS_CLONE_SUCCESS,
} from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/jetpack/settings';
import 'calypso/state/jetpack/init';

export const requestJetpackSettings = ( siteId ) => ( {
	type: JETPACK_SETTINGS_REQUEST,
	siteId,
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

export const cloneJetpackSettings = ( siteId, sourceSiteId ) => ( {
	type: JETPACK_SETTINGS_CLONE,
	siteId,
	sourceSiteId,
	meta: {
		dataLayer: {
			trackRequest: true,
		},
	},
} );

export const cloneJetpackSettingsSuccess = ( siteId ) => ( {
	type: JETPACK_SETTINGS_CLONE_SUCCESS,
	siteId,
} );

/**
 * Regenerate the target email of Post by Email.
 * @param  {number}     siteId  ID of the site.
 * @returns {Object}          Action object to regenerate the email when dispatched.
 */
export const regeneratePostByEmail = ( siteId ) =>
	saveJetpackSettings( siteId, { post_by_email_address: 'regenerate' } );
