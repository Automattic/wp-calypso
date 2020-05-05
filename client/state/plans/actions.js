/**
 * Internal dependencies
 */
import {
	PLANS_RECEIVE,
	PLANS_REQUEST,
	PLANS_REQUEST_SUCCESS,
	PLANS_REQUEST_FAILURE,
} from 'state/action-types';
import 'state/data-layer/wpcom/plans';

/**
 * Action creator function: RECEIVE
 *
 * @param {Array} plans - WordPress.com plans list
 * @returns {object} action object
 */
export const plansReceiveAction = ( plans ) => {
	return {
		type: PLANS_RECEIVE,
		plans,
	};
};

/**
 * Action creator function: REQUEST_SUCCESS
 *
 * @returns {object} action object
 */
export const plansRequestSuccessAction = () => {
	return { type: PLANS_REQUEST_SUCCESS };
};

/**
 * Action creator function: REQUEST_FAILURE
 *
 * @param {string} error - error message
 * @returns {object} action object
 */
export const plansRequestFailureAction = ( error ) => {
	return {
		type: PLANS_REQUEST_FAILURE,
		error: error,
	};
};

/**
 * Action creator to request WordPress.com plans: REQUEST
 *
 * @returns {object} action object
 */
export const requestPlans = () => ( {
	type: PLANS_REQUEST,
} );
