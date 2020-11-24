/**
 * External dependencies
 */
import { useEffect, useRef } from 'react';

export default function useShowAddCouponSuccessMessage(
	didAddCoupon: boolean,
	couponCode: string,
	showAddCouponSuccessMessage: ( couponCode: string ) => void
): void {
	const lastCouponCode = useRef< string >( '' );
	useEffect( () => {
		if ( didAddCoupon && couponCode && couponCode !== lastCouponCode.current ) {
			showAddCouponSuccessMessage( couponCode );
		}
		lastCouponCode.current = couponCode;
	}, [ couponCode, didAddCoupon, showAddCouponSuccessMessage ] );
}
