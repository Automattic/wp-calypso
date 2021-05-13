/**
 * Internal dependencies
 */

import {
	ACTIVE_PROMOTIONS_RECEIVE,
	ACTIVE_PROMOTIONS_REQUEST,
	ACTIVE_PROMOTIONS_REQUEST_SUCCESS,
	ACTIVE_PROMOTIONS_REQUEST_FAILURE,
} from 'calypso/state/action-types';

// WP REST-API error response
export const ERROR_MESSAGE_RESPONSE =
	'There was a problem fetching activePromotions. Please try again later or contact support.';

export const ACTIVE_PROMOTION_1 = 'spring_sale';
export const ACTIVE_PROMOTION_1003 = 'valentine_promotion';
export const ACTIVE_PROMOTION_1008 = 'spring_sale_2';
export const ACTIVE_PROMOTION_1009 = 'spring_sale_3';
export const ACTIVE_PROMOTION_1029 = 'spring_sale_4';
export const ACTIVE_PROMOTION_2000 = 'spring_sale_5';
export const ACTIVE_PROMOTION_2001 = 'spring_sale_6';
export const ACTIVE_PROMOTION_2002 = 'spring_sale_7';
export const ACTIVE_PROMOTION_2003 = 'spring_sale_8';

export const WPCOM_RESPONSE = [
	ACTIVE_PROMOTION_1,
	ACTIVE_PROMOTION_1003,
	ACTIVE_PROMOTION_1008,
	ACTIVE_PROMOTION_1009,
	ACTIVE_PROMOTION_1029,
	ACTIVE_PROMOTION_2000,
	ACTIVE_PROMOTION_2001,
	ACTIVE_PROMOTION_2002,
	ACTIVE_PROMOTION_2003,
];

export const ACTIVE_PROMOTIONS = WPCOM_RESPONSE;

// actions
export const ACTION_ACTIVE_PROMOTIONS_RECEIVE = {
	type: ACTIVE_PROMOTIONS_RECEIVE,
	activePromotions: ACTIVE_PROMOTIONS,
};

export const ACTION_ACTIVE_PROMOTIONS_REQUEST = {
	type: ACTIVE_PROMOTIONS_REQUEST,
};

export const ACTION_ACTIVE_PROMOTIONS_REQUEST_SUCCESS = {
	type: ACTIVE_PROMOTIONS_REQUEST_SUCCESS,
};

export const ACTION_ACTIVE_PROMOTIONS_REQUEST_FAILURE = {
	type: ACTIVE_PROMOTIONS_REQUEST_FAILURE,
	error: ERROR_MESSAGE_RESPONSE,
};

/**
 * Return a whole state instance
 *
 * - requesting: false
 * - error: false
 *
 * @returns {object} an state instance
 */
export const getStateInstance = () => {
	return {
		activePromotions: {
			items: [ ...ACTIVE_PROMOTIONS ],
			requesting: false,
			error: false,
		},
	};
};
