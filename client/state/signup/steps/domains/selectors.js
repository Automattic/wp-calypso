/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

export function getDomainSearchPrefill( state ) {
	return get( state, 'signup.steps.domains.prefill', '' );
}
