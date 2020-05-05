/**
 * Internal dependencies
 */

import {
	ACTIVE_PROMOTIONS_RECEIVE,
	ACTIVE_PROMOTIONS_REQUEST,
	ACTIVE_PROMOTIONS_REQUEST_SUCCESS,
	ACTIVE_PROMOTIONS_REQUEST_FAILURE,
} from 'state/action-types';

import 'state/data-layer/wpcom/active-promotions';

/**
 * Action creator function: RECEIVE
 *
 * @param {Array} activePromotions - WordPress.com activePromotions list
 * @returns {object} action object
 */
export const activePromotionsReceiveAction = ( activePromotions ) => {
	return {
		type: ACTIVE_PROMOTIONS_RECEIVE,
		activePromotions,
	};
};

/**
 * Action creator function: REQUEST_SUCCESS
 *
 * @returns {object} action object
 */
export const activePromotionsRequestSuccessAction = () => {
	return { type: ACTIVE_PROMOTIONS_REQUEST_SUCCESS };
};

/**
 * Action creator function: REQUEST_FAILURE
 *
 * @param {string} error - error message
 * @returns {object} action object
 */
export const activePromotionsRequestFailureAction = ( error ) => {
	return {
		type: ACTIVE_PROMOTIONS_REQUEST_FAILURE,
		error: error,
	};
};

/**
 * Action creator to request WordPress.com activePromotions: REQUEST
 *
 * @returns {object} action object
 */
export const requestActivePromotions = () => ( {
	type: ACTIVE_PROMOTIONS_REQUEST,
} );
