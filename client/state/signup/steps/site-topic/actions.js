/** @format */

/**
 * Internal dependencies
 */
import { SIGNUP_STEPS_SITE_TOPIC_SET } from 'state/action-types';
import SignupActions from 'lib/signup/actions';

export const setSiteTopic = siteTopic => ( {
	type: SIGNUP_STEPS_SITE_TOPIC_SET,
	siteTopic,
} );

// It's a thunk since there is still Flux involved, so it can't be a plain object yet.
// If the signup state is fully reduxified, we can just keep setSiteTopic() and
// keep all the dependency filling and progress filling in a middleware.
export const submitSiteTopic = siteTopic => {
	return dispatch => {
		dispatch( setSiteTopic( siteTopic ) );

		SignupActions.submitSignupStep( { stepName: 'site-topic' }, [], { siteTopic } );
	};
};
