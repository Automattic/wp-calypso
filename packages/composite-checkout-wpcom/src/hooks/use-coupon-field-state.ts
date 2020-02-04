/**
 * External dependencies
 */
import { useState } from 'react';

export type CouponFieldStateProps = {
	couponFieldValue: string;
	setCouponFieldValue: ( string ) => void;
	isApplyButtonActive: boolean;
	setIsApplyButtonActive: ( boolean ) => void;
	isFreshOrEdited: boolean;
	setIsFreshOrEdited: ( boolean ) => void;
};

export default function useCouponFieldState(): CouponFieldStateProps {
	const [ couponFieldValue, setCouponFieldValue ] = useState< string >( '' );

	// Used to hide the `Apply` button
	const [ isApplyButtonActive, setIsApplyButtonActive ] = useState< boolean >( false );

	// Used to hide error messages if the user has edited the form field
	const [ isFreshOrEdited, setIsFreshOrEdited ] = useState< boolean >( true );

	return {
		couponFieldValue,
		setCouponFieldValue,
		isApplyButtonActive,
		setIsApplyButtonActive,
		isFreshOrEdited,
		setIsFreshOrEdited,
	};
}
