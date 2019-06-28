/** @format */

/**
 * Internal dependencies
 */

import { SIGNUP_STEPS_SITE_TYPE_SET } from 'state/action-types';
import { submitSignupStep } from 'state/signup/progress/actions';

export function setSiteType( siteType ) {
	return {
		type: SIGNUP_STEPS_SITE_TYPE_SET,
		siteType,
	};
}

export function submitSiteType( siteType, theme ) {
	return dispatch => {
		const themeSlugWithRepo = theme || 'pub/independent-publisher-2';

		dispatch( setSiteType( siteType ) );
		dispatch( submitSignupStep( { stepName: 'site-type' }, { siteType, themeSlugWithRepo } ) );
	};
}
