/**
 * External dependencies
 */
import React from 'react';
import styled from '@emotion/styled';
import {
	CheckoutCheckIcon,
	CheckoutSummaryCard,
	renderDisplayValueMarkdown,
	useLineItemsOfType,
	useTotal,
} from '@automattic/composite-checkout';
import { useTranslate } from 'i18n-calypso';

export default function WPCheckoutOrderSummary() {
	const translate = useTranslate();
	const taxes = useLineItemsOfType( 'tax' );
	const coupons = useLineItemsOfType( 'coupon' );
	const total = useTotal();

	return (
		<CheckoutSummaryCard>
			<CheckoutSummaryTitle>{ translate( 'Purchase Details' ) }</CheckoutSummaryTitle>
			<CheckoutSummaryFeatures>
				<CheckoutSummaryFeaturesTitle>
					{ translate( 'Included with your purchase' ) }
				</CheckoutSummaryFeaturesTitle>
				<CheckoutSummaryFeaturesList>
					<CheckoutSummaryFeaturesListItem>
						<WPCheckoutCheckIcon />
						{ translate( 'Email and live chat support' ) }
					</CheckoutSummaryFeaturesListItem>
					<CheckoutSummaryFeaturesListItem>
						<WPCheckoutCheckIcon />
						{ translate( 'Money back guarantee' ) }
					</CheckoutSummaryFeaturesListItem>
				</CheckoutSummaryFeaturesList>
			</CheckoutSummaryFeatures>
			<CheckoutSummaryAmountWrapper>
				{ coupons.map( ( coupon ) => (
					<CheckoutSummaryLineItem key={ 'checkout-summary-line-item-' + coupon.id }>
						<span>{ coupon.label }</span>
						<span>{ renderDisplayValueMarkdown( coupon.amount.displayValue ) }</span>
					</CheckoutSummaryLineItem>
				) ) }
				{ taxes.map( ( tax ) => (
					<CheckoutSummaryLineItem key={ 'checkout-summary-line-item-' + tax.id }>
						<span>{ tax.label }</span>
						<span>{ renderDisplayValueMarkdown( tax.amount.displayValue ) }</span>
					</CheckoutSummaryLineItem>
				) ) }
				<CheckoutSummaryTotal>
					<span>{ translate( 'Total' ) }</span>
					<span>{ renderDisplayValueMarkdown( total.amount.displayValue ) }</span>
				</CheckoutSummaryTotal>
			</CheckoutSummaryAmountWrapper>
		</CheckoutSummaryCard>
	);
}

const CheckoutSummaryTitle = styled.h2`
	color: ${( props ) => props.theme.colors.textColor};
	display: none;
	font-weight: ${( props ) => props.theme.weights.bold};
	padding: 20px 20px 0;

	@media ( ${( props ) => props.theme.breakpoints.desktopUp} ) {
		display: none;
	}
`;

const CheckoutSummaryFeatures = styled.div`
	padding: 20px;
`;

const CheckoutSummaryFeaturesTitle = styled.h3`
	font-size: 16px;
	font-weight: ${( props ) => props.theme.weights.normal};
	margin-bottom: 4px;
`;

const CheckoutSummaryFeaturesList = styled.ul`
	margin: 0;
	list-style: none;
	font-size: 14px;
`;

const WPCheckoutCheckIcon = styled( CheckoutCheckIcon )`
	fill: ${( props ) => props.theme.colors.success};
	margin-right: 4px;
	vertical-align: bottom;
`;

const CheckoutSummaryFeaturesListItem = styled.li`
	margin-bottom: 4px;
`;

const CheckoutSummaryAmountWrapper = styled.div`
	border-top: 1px solid ${( props ) => props.theme.colors.borderColorLight};
	padding: 20px;
`;

const CheckoutSummaryLineItem = styled.div`
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	margin-bottom: 4px;
`;

const CheckoutSummaryTotal = styled( CheckoutSummaryLineItem )`
	font-weight: ${( props ) => props.theme.weights.bold};
`;
