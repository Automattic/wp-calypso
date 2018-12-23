/** @format */

/**
 * Internal dependencies
 */

import { SIGNUP_STEPS_SITE_VERTICAL_SET } from 'state/action-types';

export function setSiteInformation( { name, slug } ) {
	return {
		type: SIGNUP_STEPS_SITE_VERTICAL_SET,
		name,
		slug,
	};
}
