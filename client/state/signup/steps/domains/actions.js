/** @format */

/**
 * Internal dependencies
 */

import { SIGNUP_STEPS_DOMAIN_SEARCH_PREFILL_SET } from 'state/action-types';

export function setDomainSearchPrefill( prefill, overwrite = false ) {
	return {
		type: SIGNUP_STEPS_DOMAIN_SEARCH_PREFILL_SET,
		prefill,
		overwrite,
	};
}
