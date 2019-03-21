/** @format */

/**
 * Internal dependencies
 */

import {
	SIGNUP_STEPS_SITE_VERTICAL_SET,
	SIGNUP_VERTICALS_REQUEST,
	SIGNUP_VERTICALS_SET,
} from 'state/action-types';
import SignupActions from 'lib/signup/actions';

import 'state/data-layer/wpcom/signup/verticals';

/**
 * Action creator: Set site vertical data
 *
 * @param {Object} siteVerticalData An object containing `isUserInput`, `name`, `preview` and `slug` vertical values.
 * @return {Object} The action object.
 */
export function setSiteVertical( siteVerticalData ) {
	return {
		type: SIGNUP_STEPS_SITE_VERTICAL_SET,
		...siteVerticalData,
	};
}

/**
 * Action creator: Request verticals data.
 *
 * @param {String} search The search term for requesting the matching verticals.
 * @param {Number} limit The maximum number of vertical items.
 *
 * @return {Object} The action object.
 */
export const requestVerticals = ( search, limit ) => ( {
	type: SIGNUP_VERTICALS_REQUEST,
	search,
	limit,
} );

/**
 * Action creator: Store verticals found for a given search term in the state tree.
 *
 * @param {String} search The search term which the verticals data matching with.
 * @param {Array} verticals The verticals data matches with the given search term.
 *
 * @return {Object} The action object.
 */
export const setVerticals = ( search, verticals ) => ( {
	type: SIGNUP_VERTICALS_SET,
	search,
	verticals,
} );

/**
 * It's a thunk since there is still Flux involved, so it can't be a plain object yet.
 * If the signup state is fully reduxified, we can just keep setSiteVertical() and
 * keep all the dependency filling and progress filling in a middleware.
 *
 * @param {Object} siteVerticalData An object containing `isUserInput`, `name`, `preview` and `slug` vertical values.
 * @param {String} stepName The name of the step to submit. Default is `site-topic`
 * @return {Function} A thunk
 */
export const submitSiteVertical = ( siteVerticalData, stepName = 'site-topic' ) => dispatch => {
	dispatch( setSiteVertical( siteVerticalData ) );
	SignupActions.submitSignupStep( { stepName }, [], { siteTopic: siteVerticalData.name } );
};
