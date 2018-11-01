/** @format */

/**
 * Internal dependencies
 */

import { SIGNUP_STEPS_SITE_INFORMATION_SET } from 'state/action-types';

export function setSiteInformation( { address, email, phone } ) {
	return {
		type: SIGNUP_STEPS_SITE_INFORMATION_SET,
		address,
		email,
		phone,
	};
}
