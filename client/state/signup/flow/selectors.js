/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

export function getCurrentFlow( state ) {
	return get( state, 'signup.flow.currentFlow', '' );
}
