/**
 * Internal dependencies
 */
import { SIGNUP_STEPS_SITE_STYLE_SET } from 'calypso/state/action-types';

import 'calypso/state/signup/init';

export function setSiteStyle( siteStyle ) {
	return {
		type: SIGNUP_STEPS_SITE_STYLE_SET,
		siteStyle,
	};
}
