/** @format */

/**
 * Internal dependencies
 */

import { SIGNUP_STEPS_SITE_TITLE_SET } from 'client/state/action-types';

export function setSiteTitle( siteTitle ) {
	return {
		type: SIGNUP_STEPS_SITE_TITLE_SET,
		siteTitle,
	};
}
