/** @format */

/**
 * Internal dependencies
 */

import { SIGNUP_STEPS_RIVET_ADDRESS_SET } from 'state/action-types';

export function setRivetAddress( rivetAddress ) {
	return {
		type: SIGNUP_STEPS_RIVET_ADDRESS_SET,
		rivetAddress,
	};
}
