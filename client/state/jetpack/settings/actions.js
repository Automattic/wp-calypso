import {
	JETPACK_SETTINGS_REQUEST,
	JETPACK_SETTINGS_SAVE,
	JETPACK_SETTINGS_SAVE_SUCCESS,
	JETPACK_SETTINGS_UPDATE,
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
