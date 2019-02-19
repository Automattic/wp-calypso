/** @format */

/**
 * Internal dependencies
 */

import { SIGNUP_STEPS_SITE_INFORMATION_SET } from 'state/action-types';

export function setSiteInformation( siteInformation ) {
	return {
		type: SIGNUP_STEPS_SITE_INFORMATION_SET,
		data: siteInformation,
	};
}
