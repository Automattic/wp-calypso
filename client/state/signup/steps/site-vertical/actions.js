/** @format */

/**
 * Internal dependencies
 */

import { SIGNUP_STEPS_SITE_VERTICAL_SET } from 'state/action-types';
import SignupActions from 'lib/signup/actions';

export function setSiteVertical( { isUserInput, name, slug } ) {
	return {
		type: SIGNUP_STEPS_SITE_VERTICAL_SET,
		isUserInput,
		name,
		slug,
	};
}

// It's a thunk since there is still Flux involved, so it can't be a plain object yet.
// If the signup state is fully reduxified, we can just keep setSiteVertical() and
// keep all the dependency filling and progress filling in a middleware.
export const submitSiteVertical = ( { isUserInput, name, slug } ) => dispatch => {
	dispatch( setSiteVertical( { isUserInput, name, slug } ) );
	SignupActions.submitSignupStep( { stepName: 'site-topic' }, [], { siteTopic: name } );
};
