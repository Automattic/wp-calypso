/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	PLANS_RECEIVE,
	PLANS_REQUEST,
	PLANS_REQUEST_SUCCESS,
	PLANS_REQUEST_FAILURE
} from '../action-types';

import { insertPersonalPlan } from 'lib/plans/personal-plan';
/**
 * Action creator function: RECEIVE
 *
 * @param {Array} plans - WordPress.com plans list
 * @return {Object} action object
 */
export const plansReceiveAction = plans => {
	return {
		type: PLANS_RECEIVE,
		plans: insertPersonalPlan( plans )
	};
};

/**
 * Action creator function: REQUEST
 *
 * @return {Object} action object
 */
export const plansRequestAction = () => {
	return { type: PLANS_REQUEST };
};

/**
 * Action creator function: REQUEST_SUCCESS
 *
 * @return {Object} action object
 */
export const plansRequestSuccessAction = () => {
	return { type: PLANS_REQUEST_SUCCESS };
};

/**
 * Action creator function: REQUEST_FAILURE
 *
 * @param {String} error - error message
 * @return {Object} action object
 */
export const plansRequestFailureAction = error => {
	return {
		type: PLANS_REQUEST_FAILURE,
		error: error
	};
};

/**
 * Get valid and useful data from endpoint response
 * Cleaning some fields, etc
 *
 * @param {Object} response - endpoint response
 * @return {Array} plans list
 */

export const getValidDataFromResponse = response => {
	// remove _header field
	delete response._headers;

	return response;
};

/**
 * Fetch WordPress.com plans
 *
 * @return {Promise} Promise
 */

export const requestPlans = () => {
	return dispatch => {
		dispatch( plansRequestAction() );

		return wpcom
			.plans()
			.list( { apiVersion: '1.2' } )
			.then( data => {
				dispatch( plansRequestSuccessAction() );
				dispatch( plansReceiveAction( getValidDataFromResponse( data ) ) );
			} )
			.catch( ( error ) => {
				const message = error instanceof Error
					? error.message
					: error;

				dispatch( plansRequestFailureAction( message ) );
			} );
	};
};
