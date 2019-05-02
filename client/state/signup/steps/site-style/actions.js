/** @format */

/**
 * Internal dependencies
 */

import {
	SIGNUP_STEPS_SITE_STYLE_SET,
	SIGNUP_STEPS_SITE_STYLE_UPDATE_PREVIEW,
} from 'state/action-types';

export function setSiteStyle( siteStyle ) {
	return {
		type: SIGNUP_STEPS_SITE_STYLE_SET,
		siteStyle,
	};
}

export function updateSiteMockupDisplayAction() {
	return { type: SIGNUP_STEPS_SITE_STYLE_UPDATE_PREVIEW };
}
