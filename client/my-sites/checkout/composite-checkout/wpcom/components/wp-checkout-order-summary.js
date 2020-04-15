/**
 * External dependencies
 */
import React from 'react';
import styled from '@emotion/styled';
import {
	useLineItemsOfType,
	useTotal,
	renderDisplayValueMarkdown,
} from '@automattic/composite-checkout';
import { useTranslate } from 'i18n-calypso';

export default function WPCheckoutOrderSummary() {
	const translate = useTranslate();
	const taxes = useLineItemsOfType( 'tax' );
	const total = useTotal();

	return (
		<CheckoutSummaryWrapper className="components__checkout-order-summary">
			<CheckoutSummaryTitle>{ translate( 'Purchase Details' ) }</CheckoutSummaryTitle>
			<CheckoutSummaryAmountWrapper>
				{ taxes.map( tax => (
					<CheckoutSummaryLineItem key={ 'checkout-summary-line-item-' + tax.id }>
						<CheckoutSummaryLabel>{ tax.label }</CheckoutSummaryLabel>
						<CheckoutSummaryAmount>
							{ renderDisplayValueMarkdown( tax.amount.displayValue ) }
						</CheckoutSummaryAmount>
					</CheckoutSummaryLineItem>
				) ) }
				<CheckoutSummaryTotal>
					<CheckoutSummaryLabel>{ translate( 'Total' ) }</CheckoutSummaryLabel>
					<CheckoutSummaryAmount>
						{ renderDisplayValueMarkdown( total.amount.displayValue ) }
					</CheckoutSummaryAmount>
				</CheckoutSummaryTotal>
			</CheckoutSummaryAmountWrapper>
		</CheckoutSummaryWrapper>
	);
}

const CheckoutSummaryWrapper = styled.div`
	background: ${props => props.theme.colors.surface};
	border: 1px solid ${props => props.theme.colors.borderColorLight};

	@media ( ${props => props.theme.breakpoints.desktopUp} ) {
		float: right;
		margin-left: 16px;
		width: 326px;
	}
`;

const CheckoutSummaryTitle = styled.h2`
	color: ${props => props.theme.colors.textColor};
	font-weight: ${props => props.theme.weights.bold};
	padding: 16px;
`;

const CheckoutSummaryAmountWrapper = styled.div`
	border-top: 1px solid ${props => props.theme.colors.borderColorLight};
	padding: 16px;
`;

const CheckoutSummaryLabel = styled.span``;

const CheckoutSummaryAmount = styled.span``;

const CheckoutSummaryLineItem = styled.div`
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
`;

const CheckoutSummaryTotal = styled( CheckoutSummaryLineItem )`
	font-weight: ${props => props.theme.weights.bold};
`;
