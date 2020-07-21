/**
 * External dependencies
 */
import { useEffect } from 'react';

/**
 * Internal dependencies
 */
import { ResponseCart } from '../../types';
import { ShoppingCartAction } from './types';

export default function useShowAddCouponSuccessMessage(
	didAddCoupon: boolean,
	responseCart: ResponseCart,
	showAddCouponSuccessMessage: ( arg0: string ) => void,
	hookDispatch: ( arg0: ShoppingCartAction ) => void
): void {
	useEffect( () => {
		if ( didAddCoupon ) {
			showAddCouponSuccessMessage( responseCart.coupon );
			hookDispatch( { type: 'DID_SHOW_ADD_COUPON_SUCCESS_MESSAGE' } );
		}
	}, [ didAddCoupon, responseCart.coupon, showAddCouponSuccessMessage, hookDispatch ] );
}
