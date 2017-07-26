/**
 * Internal dependencies
 */
import { SIGNUP_STEPS_JPO_SITE_TYPE_SET } from 'state/action-types';

export function setJPOSiteType( siteType ) {
	console.log( 'setJPOSiteType: ', siteType );

	return {
		type: SIGNUP_STEPS_JPO_SITE_TYPE_SET,
		siteType
	};
}