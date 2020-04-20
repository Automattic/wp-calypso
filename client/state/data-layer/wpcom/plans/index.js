/**
 * Internal dependencies
 */
import { registerHandlers } from 'state/data-layer/handler-registry';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { PLANS_REQUEST } from 'state/action-types';
import {
	plansReceiveAction,
	plansRequestFailureAction,
	plansRequestSuccessAction,
} from 'state/plans/actions';

/**
 * @module state/data-layer/wpcom/plans
 */

/**
 * Dispatches a request to fetch all available WordPress.com plans
 *
 * @param {object} action Redux action
 * @returns {object} original action
 */
export const requestPlans = ( action ) =>
	http(
		{
			apiVersion: '1.5',
			method: 'GET',
			path: '/plans',
		},
		action
	);

/**
 * Dispatches returned WordPress.com plan data
 *
 * @param {object} action Redux action
 * @param {Array} plans raw data from plans API
 * @returns {Array<object>} Redux actions
 */
export const receivePlans = ( action, plans ) => [
	plansRequestSuccessAction(),
	plansReceiveAction( plans ),
];

/**
 * Dispatches returned error from plans request
 *
 * @param {object} action Redux action
 * @param {object} rawError raw error from HTTP request
 * @returns {object} Redux action
 */
export const receiveError = ( action, rawError ) =>
	plansRequestFailureAction( rawError instanceof Error ? rawError.message : rawError );

export const dispatchPlansRequest = dispatchRequest( {
	fetch: requestPlans,
	onSuccess: receivePlans,
	onError: receiveError,
} );

registerHandlers( 'state/data-layer/wpcom/plans', {
	[ PLANS_REQUEST ]: [ dispatchPlansRequest ],
} );
