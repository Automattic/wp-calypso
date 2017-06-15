/**
 * Internal dependencies
 */
import { SIGNUP_STEPS_SITE_TYPE_SET } from 'state/action-types';

export function setSiteType( siteType ) {
	return {
		type: SIGNUP_STEPS_SITE_TYPE_SET,
		siteType
	};
}
