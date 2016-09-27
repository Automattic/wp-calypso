/**
 * Internal dependencies
 */
import { SIGNUP_STEPS_SITE_TITLE } from 'state/action-types';

export function setSiteTitle( siteTitle ) {
	return {
		type: SIGNUP_STEPS_SITE_TITLE,
		siteTitle
	};
}
