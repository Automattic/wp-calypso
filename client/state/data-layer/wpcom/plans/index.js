/**
 * Internal dependencies
 */
import { PLANS_REQUEST } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { plansReceiveAction, plansRequestFailureAction, plansRequestSuccessAction } from 'state/plans/actions';

/**
 * @module state/data-layer/wpcom/plans
 */

/**
 * Dispatches a request to fetch all available WordPress.com plans
 *
 * @param {Function} dispatch Redux dispatcher
 * @param {Object} action Redux action
 * @returns {Object} original action
 */
export const requestPlans = ( { dispatch }, action ) => dispatch( http( {
	apiVersion: '1.4',
	method: 'GET',
	path: '/plans',
	onSuccess: action,
	onFailure: action,
} ) );

/**
 * Dispatches returned WordPress.com plan data
 *
 * @param {Function} dispatch Redux dispatcher
 * @param {Object} action Redux action
 * @param {Array} plans raw data from plans API
 */
export const receivePlans = ( { dispatch }, action, plans ) => {
	dispatch( plansRequestSuccessAction() );
	dispatch( plansReceiveAction( plans ) );
};

/**
 * Dispatches returned error from plans request
 *
 * @param {Function} dispatch Redux dispatcher
 * @param {Object} action Redux action
 * @param {Object} rawError raw error from HTTP request
 */
export const receiveError = ( { dispatch }, action, rawError ) => {
	const error = rawError instanceof Error
		? rawError.message
		: rawError;

	dispatch( plansRequestFailureAction( error ) );
};

export const dispatchPlansRequest = dispatchRequest( requestPlans, receivePlans, receiveError );

export default {
	[ PLANS_REQUEST ]: [ dispatchPlansRequest ],
};
