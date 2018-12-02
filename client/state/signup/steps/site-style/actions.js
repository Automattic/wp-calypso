/** @format */

/**
 * Internal dependencies
 */

import { SIGNUP_STEPS_SITE_STYLE_SET } from 'state/action-types';

export function setSiteStyle( siteStyle ) {
	return {
		type: SIGNUP_STEPS_SITE_STYLE_SET,
		siteStyle,
	};
}
