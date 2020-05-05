/**
 * Internal dependencies
 */
import { SIGNUP_STEPS_SITE_TITLE_SET } from 'state/action-types';

import 'state/signup/init';

export function setSiteTitle( siteTitle ) {
	return {
		type: SIGNUP_STEPS_SITE_TITLE_SET,
		siteTitle,
	};
}
