/** @format */

/**
 * Internal dependencies
 */

import { SIGNUP_STEPS_SITE_VERTICAL_SET } from 'state/action-types';
import SignupActions from 'lib/signup/actions';

/**
 * Action creator: Set site vertical data
 *
 * @param {Object} siteVerticalData An object containing `name` and `slug` vertical values.
 * @return {Object} The action object.
 */
export function setSiteVertical( { name, slug } ) {
	return {
		type: SIGNUP_STEPS_SITE_VERTICAL_SET,
		name,
		slug,
	};
}

/**
 * It's a thunk since there is still Flux involved, so it can't be a plain object yet.
 * If the signup state is fully reduxified, we can just keep setSiteVertical() and
 * keep all the dependency filling and progress filling in a middleware.
 *
 * @param {Object} siteVerticalData An object containing `name` and `slug` vertical values.
 * @param {String} stepName The name of the step to submit. Default is `site-topic`
 * @return {Function} A thunk
 */
export const submitSiteVertical = ( { name, slug }, stepName = 'site-topic' ) => dispatch => {
	dispatch( setSiteVertical( { name, slug } ) );
	SignupActions.submitSignupStep( { stepName }, [], { siteTopic: name } );
};
