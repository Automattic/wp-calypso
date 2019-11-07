/**
 * External dependencies
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

/**
 * Internal dependencies
 */
import { useLocalize } from '../lib/localize';
import Button from './button';
import Coupon from './coupon';

export default function CheckoutOrderSummary( { CheckoutHeader } ) {
	const localize = useLocalize();
	//TODO: tie the default coupon field visibility based on whether there is a coupon in the cart
	const [ isCouponFieldVisible, setIsCouponFieldVisible ] = useState( false );
	const [ hasCouponBeenApplied, setHasCouponBeenApplied ] = useState( false );

	if ( CheckoutHeader ) {
		return <CheckoutHeader />;
	}

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

CheckoutOrderSummary.propTypes = {
	CheckoutHeader: PropTypes.elementType,
};

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
	return;
}
