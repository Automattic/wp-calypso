import { withStorageKey } from '@automattic/state-utils';
import { MARKETING_JETPACK_SALE_COUPON_RECEIVE } from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';
import 'calypso/state/marketing/init';

/**
 * Set the Jetpack sale coupon
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}       Updated state
 */
export const jetpackSaleCoupon = ( state = null, action ) => {
	switch ( action.type ) {
		case MARKETING_JETPACK_SALE_COUPON_RECEIVE:
			return action.jetpackSaleCoupon.coupon;
	}

	return state;
};

const reducer = combineReducers( {
	jetpackSaleCoupon,
} );

export default withStorageKey( 'marketing', reducer );
