/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

export function getRivetAddress( state ) {
	return get( state, 'signup.steps.rivetNameAddress', '' );
}
