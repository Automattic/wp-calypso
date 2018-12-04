/** @format */

/**
 * Internal dependencies
 */

import { SIGNUP_STEPS_SITE_TYPE_SET } from 'state/action-types';
import { getSiteTypePropertyValue } from 'lib/signup/site-type';
import SignupActions from 'lib/signup/actions';

export function setSiteType( siteType ) {
	return {
		type: SIGNUP_STEPS_SITE_TYPE_SET,
		siteType,
	};
}

// It's a thunk since there is still Flux involved, so it can't be a plain object yet.
// If the signup state is fully reduxified, we can just keep setSiteType() and
// keep all the dependency filling and progress filling in a middleware.
export function submitSiteType( siteType ) {
	return dispatch => {
		dispatch( setSiteType( siteType ) );

		const themeSlugWithRepo =
			getSiteTypePropertyValue( 'slug', siteType, 'theme' ) || 'pub/independent-publisher-2';

		SignupActions.submitSignupStep(
			{
				stepName: 'site-type',
			},
			[],
			{
				siteType,
				themeSlugWithRepo,
			}
		);
	};
}
