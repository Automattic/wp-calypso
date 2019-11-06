/**
 * Internal dependencies
 */

import { SIGNUP_STEPS_SITE_TYPE_SET } from 'state/action-types';
import { getSiteTypePropertyValue } from 'lib/signup/site-type';
import { submitSignupStep } from 'state/signup/progress/actions';

export function setSiteType( siteType ) {
	return {
		type: SIGNUP_STEPS_SITE_TYPE_SET,
		siteType,
	};
}

export function submitSiteType( siteType, stepName = 'site-type' ) {
	return dispatch => {
		dispatch( setSiteType( siteType ) );

		const themeSlugWithRepo =
			getSiteTypePropertyValue( 'slug', siteType, 'theme' ) || 'pub/independent-publisher-2';

		dispatch( submitSignupStep( { stepName }, { siteType, themeSlugWithRepo } ) );
	};
}
