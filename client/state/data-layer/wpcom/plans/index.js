/**
 * Internal dependencies
 */
import { fetch } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { PLANS_REQUEST } from 'state/action-types';
import {
	plansReceiveAction,
	plansRequestFailureAction,
	plansRequestSuccessAction,
} from 'state/plans/actions';

/**
 * Dispatches a request to fetch all available WordPress.com plans
 *
 * @param {Function} dispatch Redux dispatcher
 * @param {Object} action Redux action
 * @returns {Object} HTTP request action
 */
export const requestPlans = ( { dispatch }, action ) =>
	dispatch( fetch( {
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
 * @param {Function} next dispatches to next middleware in chain
 * @param {Array} plans raw data from plans API
 */
export const receivePlans = ( { dispatch }, action, next, plans ) => {
	dispatch( plansRequestSuccessAction() );
	dispatch( plansReceiveAction( plans ) );
};

/**
 * Dispatches returned error from plans request
 *
 * @param {Function} dispatch Redux dispatcher
 * @param {Object} action Redux action
 * @param {Function} next dispatches to next middleware in chain
 * @param {Object} rawError raw error from HTTP request
 */
export const receiveError = ( { dispatch }, action, next, rawError ) => {
	const error = rawError instanceof Error
		? rawError.message
		: rawError;

	dispatch( plansRequestFailureAction( error ) );
};

export const dispatchPlansRequest = dispatchRequest( requestPlans, receivePlans, receiveError );

export default {
	[ PLANS_REQUEST ]: [ dispatchPlansRequest ],
};
