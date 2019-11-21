/**
 * External dependencies
 */
import React, { useState } from 'react';
import styled from '@emotion/styled';
import { useLineItems, useTotal, renderDisplayValueMarkdown } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import { useLocalize } from '../lib/localize'; // TODO: remove this
import Button from './button';
import Coupon from './coupon';

export default function WPCheckoutOrderSummary() {
	const localize = useLocalize();
	const [ items ] = useLineItems();
	//TODO: tie the default coupon field visibility based on whether there is a coupon in the cart
	const [ isCouponFieldVisible, setIsCouponFieldVisible ] = useState( false );
	const [ hasCouponBeenApplied, setHasCouponBeenApplied ] = useState( false );

	return (
		<React.Fragment>
			<SummaryContent>
				<ProductList>
					{ items.map( product => {
						return <ProductListItem key={ product.id }>{ product.label }</ProductListItem>;
					} ) }
				</ProductList>

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
			</SummaryContent>

			<CouponField
				id="order-summary-coupon"
				isCouponFieldVisible={ isCouponFieldVisible }
				couponAdded={ () => {
					handleCouponAdded( setIsCouponFieldVisible, setHasCouponBeenApplied );
				} }
			/>
		</React.Fragment>
	);
}

export function WPCheckoutOrderSummaryTitle() {
	const localize = useLocalize();
	const total = useTotal();
	return (
		<CheckoutSummaryTitle>
			<span>{ localize( 'You are all set to check out' ) }</span>
			<CheckoutSummaryTotal>
				{ renderDisplayValueMarkdown( total.amount.displayValue ) }
			</CheckoutSummaryTotal>
		</CheckoutSummaryTitle>
	);
}

const CheckoutSummaryTitle = styled.span`
	display: flex;
	justify-content: space-between;
`;

const CheckoutSummaryTotal = styled.span`
	font-weight: ${props => props.theme.weights.bold};
`;

const SummaryContent = styled.div`
	@media ( ${props => props.theme.breakpoints.smallPhoneUp} ) {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
	}
`;

const ProductList = styled.ul`
	margin: 0;
	padding: 0;
`;

const ProductListItem = styled.li`
	margin: 0;
	padding: 0;
	list-style-type: none;
`;

const CouponField = styled( Coupon )`
	margin-top: 16px;
`;

const AddCouponButton = styled( Button )`
	font-size: ${props => props.theme.fontSize.small};
	margin-top: 8px;

	@media ( ${props => props.theme.breakpoints.smallPhoneUp} ) {
		margin-top: 0;
	}
`;

function handleCouponAdded( setIsCouponFieldVisible, setHasCouponBeenApplied ) {
	setIsCouponFieldVisible( false );
	setHasCouponBeenApplied( true );
}
