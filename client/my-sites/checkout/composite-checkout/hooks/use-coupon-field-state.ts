import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

export type CouponFieldStateProps = {
	couponFieldValue: string;
	setCouponFieldValue: ( arg0: string ) => void;
	isApplyButtonActive: boolean;
	isFreshOrEdited: boolean;
	setIsFreshOrEdited: ( arg0: boolean ) => void;
	handleCouponSubmit: () => void;
};

export default function useCouponFieldState(
	applyCoupon: ( couponId: string ) => void
): CouponFieldStateProps {
	const reduxDispatch = useDispatch();
	const [ couponFieldValue, setCouponFieldValue ] = useState< string >( '' );

	// Used to hide the `Apply` button
	const [ isApplyButtonActive, setIsApplyButtonActive ] = useState< boolean >( false );

	// Used to hide error messages if the user has edited the form field
	const [ isFreshOrEdited, setIsFreshOrEdited ] = useState< boolean >( true );

	useEffect( () => {
		if ( couponFieldValue.length > 0 ) {
			setIsApplyButtonActive( true );
			return;
		}
		setIsApplyButtonActive( false );
	}, [ couponFieldValue ] );

	const handleCouponSubmit = useCallback( () => {
		const trimmedValue = couponFieldValue.trim();

		if ( isCouponValid( trimmedValue ) ) {
			reduxDispatch(
				recordTracksEvent( 'calypso_checkout_composite_coupon_add_submit', {
					coupon: trimmedValue,
				} )
			);

			applyCoupon( trimmedValue );

			return;
		}

		reduxDispatch(
			recordTracksEvent( 'calypso_checkout_composite_coupon_add_error', {
				error_type: 'Invalid code',
			} )
		);
	}, [ couponFieldValue, reduxDispatch, applyCoupon ] );

	return {
		couponFieldValue,
		setCouponFieldValue,
		isApplyButtonActive,
		isFreshOrEdited,
		setIsFreshOrEdited,
		handleCouponSubmit,
	};
}

function isCouponValid( coupon: string ) {
	// Coupon code is case-insensitive and started with an alphabet.
	// Underscores and hyphens can be included in the coupon code.
	// Per-user coupons can have a dot followed by 5-6 letter checksum for verification.
	return coupon.match( /^[a-z][a-z\d_-]+(\.[a-z\d]+)?$/i );
}
