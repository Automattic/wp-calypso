import { withStorageKey } from '@automattic/state-utils';
import {
	MARKETING_JETPACK_SALE_COUPON_RECEIVE,
	MARKETING_JETPACK_SALE_COUPON_FETCH,
	MARKETING_JETPACK_SALE_COUPON_FETCH_FAILURE,
} from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';
import 'calypso/state/marketing/init';

/**
 * Set the Jetpack sale coupon
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @returns {Object}       Updated state
 */
export const coupon = ( state = null, action ) => {
	switch ( action.type ) {
		case MARKETING_JETPACK_SALE_COUPON_RECEIVE:
			return action.jetpackSaleCoupon.coupon;
	}

	return state;
};

export const isRequesting = ( state = null, action ) => {
	switch ( action.type ) {
		case MARKETING_JETPACK_SALE_COUPON_RECEIVE:
		case MARKETING_JETPACK_SALE_COUPON_FETCH_FAILURE:
			return false;
		case MARKETING_JETPACK_SALE_COUPON_FETCH:
			return true;
	}

	return state;
};

const reducer = combineReducers( {
	jetpackSaleCoupon: combineReducers( {
		isRequesting,
		coupon,
	} ),
} );

export default withStorageKey( 'marketing', reducer );
