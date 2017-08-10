/**
 * Internal dependencies
 */
import { SIGNUP_STEPS_JPO_SITE_TITLE_SET } from 'state/action-types';

export function setJPOSiteTitle( jpoSiteTitle ) {
	console.log( 'setJPOSiteTitle: ', jpoSiteTitle );

	return {
		type: SIGNUP_STEPS_JPO_SITE_TITLE_SET,
		jpoSiteTitle
	};
}