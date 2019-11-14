/**
 * External dependencies
 */
import React, { useState } from 'react';
import styled from '@emotion/styled';

/**
 * Internal dependencies
 */
import { useLocalize } from '../lib/localize';
import Button from './button';
import Coupon from './coupon';

export default function WPCheckoutOrderSummary() {
	const localize = useLocalize();
	//TODO: tie the default coupon field visibility based on whether there is a coupon in the cart
	const [ isCouponFieldVisible, setIsCouponFieldVisible ] = useState( false );
	const [ hasCouponBeenApplied, setHasCouponBeenApplied ] = useState( false );

	return (
		<div>
			{ localize( 'Order Summary' ) }

			{ ! hasCouponBeenApplied && ! isCouponFieldVisible && (
				<AddCouponButton
					buttonState="text-button"
					onClick={ () => {
						setIsCouponFieldVisible( true );
					} }
				>
					{ localize( 'Add a coupon' ) }
				</AddCouponButton>
			) }

			<CouponField
				id="order-summary-coupon"
				isCouponFieldVisible={ isCouponFieldVisible }
				couponAdded={ () => {
					handleCouponAdded( setIsCouponFieldVisible, setHasCouponBeenApplied );
				} }
			/>
		</div>
	);
}

const CouponField = styled( Coupon )`
	margin-top: 16px;
`;

const AddCouponButton = styled( Button )`
	margin-top: 4px;
	font-size: ${props => props.theme.fontSize.small};
`;

function handleCouponAdded( setIsCouponFieldVisible, setHasCouponBeenApplied ) {
	setIsCouponFieldVisible( false );
	setHasCouponBeenApplied( true );
}
