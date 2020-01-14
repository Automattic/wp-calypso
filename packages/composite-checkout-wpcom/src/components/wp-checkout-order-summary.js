/**
 * External dependencies
 */
import React, { useState } from 'react';
import styled from '@emotion/styled';
import {
	useLineItems,
	useTotal,
	renderDisplayValueMarkdown,
	useEvents,
	useFormStatus,
} from '@automattic/composite-checkout';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from './button';
import Coupon from './coupon';

export default function WPCheckoutOrderSummary() {
	const translate = useTranslate();
	const { formStatus } = useFormStatus();
	const [ items ] = useLineItems();
	const onEvent = useEvents();
	//TODO: tie the default coupon field visibility based on whether there is a coupon in the cart
	const [ isCouponFieldVisible, setIsCouponFieldVisible ] = useState( false );
	const [ hasCouponBeenApplied, setHasCouponBeenApplied ] = useState( false );

	//TODO: Replace yourdomain.tld with actual domian: show .wordpress subdomain if no custom domain available or in the cart
	return (
		<React.Fragment>
			<DomainURL>yourdomain.tld</DomainURL>

			<SummaryContent>
				<ProductList>
					{ items.map( product => {
						return <ProductListItem key={ product.id }>{ product.label }</ProductListItem>;
					} ) }
				</ProductList>

				{ ! hasCouponBeenApplied && ! isCouponFieldVisible && formStatus === 'ready' && (
					<AddCouponButton
						buttonState="text-button"
						onClick={ () => {
							handleAddCouponButtonClick( setIsCouponFieldVisible, onEvent );
						} }
					>
						{ translate( 'Add a coupon' ) }
					</AddCouponButton>
				) }
			</SummaryContent>

			<CouponField
				id="order-summary-coupon"
				isCouponFieldVisible={ isCouponFieldVisible }
				disabled={ formStatus !== 'ready' }
				couponAdded={ () => {
					handleCouponAdded( setIsCouponFieldVisible, setHasCouponBeenApplied );
				} }
			/>
		</React.Fragment>
	);
}

export function WPCheckoutOrderSummaryTitle() {
	const translate = useTranslate();
	const total = useTotal();
	return (
		<CheckoutSummaryTitle>
			<span>{ translate( 'You are all set to check out' ) }</span>
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

const DomainURL = styled.div`
	margin-top: -12px;
`;

const SummaryContent = styled.div`
	margin-top: 12px;

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

function handleAddCouponButtonClick( setIsCouponFieldVisible, onEvent ) {
	setIsCouponFieldVisible( true );
	onEvent( {
		type: 'a8c_checkout_add_coupon_button_clicked',
	} );
}
