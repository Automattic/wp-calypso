/** @format */

/**
 * Internal dependencies
 */

import { SIGNUP_STEPS_SITE_TYPE_SET } from 'state/action-types';
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
export function submitSiteType( siteType, themeSlugWithRepo = 'pub/independent-publisher-2' ) {
	return dispatch => {
		dispatch( setSiteType( siteType ) );
		SignupActions.submitSignupStep( { stepName: 'site-type' }, { siteType, themeSlugWithRepo } );
	};
}
