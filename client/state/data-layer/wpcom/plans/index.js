/** @format */

/**
 * Internal dependencies
 */
import { http } from 'client/state/data-layer/wpcom-http/actions';
import { dispatchRequestEx } from 'client/state/data-layer/wpcom-http/utils';
import { PLANS_REQUEST } from 'client/state/action-types';
import {
	plansReceiveAction,
	plansRequestFailureAction,
	plansRequestSuccessAction,
} from 'client/state/plans/actions';

/**
 * @module state/data-layer/wpcom/plans
 */

/**
 * Dispatches a request to fetch all available WordPress.com plans
 *
 * @param {Object} action Redux action
 * @returns {Object} original action
 */
export const requestPlans = action =>
	http(
		{
			apiVersion: '1.4',
			method: 'GET',
			path: '/plans',
		},
		action
	);

/**
 * Dispatches returned WordPress.com plan data
 *
 * @param {Object} action Redux action
 * @param {Array} plans raw data from plans API
 * @returns {Array<Object>} Redux actions
 */
export const receivePlans = ( action, plans ) => [
	plansRequestSuccessAction(),
	plansReceiveAction( plans ),
];

/**
 * Dispatches returned error from plans request
 *
 * @param {Object} action Redux action
 * @param {Object} rawError raw error from HTTP request
 * @returns {Object} Redux action
 */
export const receiveError = ( action, rawError ) =>
	plansRequestFailureAction( rawError instanceof Error ? rawError.message : rawError );

export const dispatchPlansRequest = dispatchRequestEx( {
	fetch: requestPlans,
	onSuccess: receivePlans,
	onError: receiveError,
} );

export default {
	[ PLANS_REQUEST ]: [ dispatchPlansRequest ],
};
