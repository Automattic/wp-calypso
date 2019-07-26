/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

export function getBusinessName( state ) {
	return get( state, 'signup.steps.businessDetails.name', '' );
}

export function getBusinessAddress( state ) {
	return get( state, 'signup.steps.businessDetails.address', '' );
}
