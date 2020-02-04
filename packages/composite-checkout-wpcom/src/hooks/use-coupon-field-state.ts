/**
 * External dependencies
 */
import { useState, useEffect } from 'react';
import { useEvents } from '@automattic/composite-checkout';

export type CouponFieldStateProps = {
	couponFieldValue: string;
	setCouponFieldValue: ( string ) => void;
	isApplyButtonActive: boolean;
	isFreshOrEdited: boolean;
	setIsFreshOrEdited: ( boolean ) => void;
};

export default function useCouponFieldState( submitCoupon ): CouponFieldStateProps {
	const onEvent = useEvents();
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

	function handleCouponSubmit( event ) {
		event.preventDefault();
		if ( isCouponValid( couponFieldValue ) ) {
			onEvent( {
				type: 'a8c_checkout_add_coupon',
				payload: { coupon: couponFieldValue },
			} );

			submitCoupon( couponFieldValue );

			return;
		}

		onEvent( {
			type: 'a8c_checkout_add_coupon_error',
			payload: { type: 'Invalid code' },
		} );
	}

	return {
		couponFieldValue,
		setCouponFieldValue,
		isApplyButtonActive,
		isFreshOrEdited,
		setIsFreshOrEdited,
		handleCouponSubmit,
	};
}

function isCouponValid( coupon ) {
	// TODO: figure out some basic validation here
	return coupon.match( /^[a-zA-Z0-9_-]+$/ );
}
