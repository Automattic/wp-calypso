/** @format */

/**
 * Internal dependencies
 */

import {
	SIGNUP_STEPS_BUSINESS_ADDRESS_SET,
	SIGNUP_STEPS_BUSINESS_NAME_SET,
} from 'state/action-types';

export function setBusinessName( businessName ) {
	return {
		type: SIGNUP_STEPS_BUSINESS_NAME_SET,
		businessName,
	};
}

export function setBusinessAddress( businessAddress ) {
	return {
		type: SIGNUP_STEPS_BUSINESS_ADDRESS_SET,
		businessAddress,
	};
}
