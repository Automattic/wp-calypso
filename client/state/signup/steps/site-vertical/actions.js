/** @format */

/**
 * Internal dependencies
 */

import { SIGNUP_STEPS_SITE_VERTICAL_SET } from 'state/action-types';
import { requestHttpData } from 'state/data-layer/http-data';
import { http } from 'state/data-layer/wpcom-http/actions';
import { convertToCamelCase } from 'state/data-layer/utils';
import SignupActions from 'lib/signup/actions';
import { SITE_VERTICALS_REQUEST_ID, DEFAULT_SITE_VERTICAL_REQUEST_ID } from './constants';

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

export const requestVerticals = ( searchTerm, limit = 7, id = SITE_VERTICALS_REQUEST_ID ) =>
	requestHttpData(
		id,
		http( {
			apiNamespace: 'wpcom/v2',
			method: 'GET',
			path: '/verticals',
			query: {
				search: searchTerm.trim(),
				limit,
				include_preview: true,
			},
		} ),
		{
			fromApi: () => data => [ [ id, convertToCamelCase( data ) ] ],
			freshness: -Infinity,
		}
	);

export const requestDefaultVertical = ( searchTerm = 'business' ) =>
	requestVerticals( searchTerm, 1, DEFAULT_SITE_VERTICAL_REQUEST_ID );
