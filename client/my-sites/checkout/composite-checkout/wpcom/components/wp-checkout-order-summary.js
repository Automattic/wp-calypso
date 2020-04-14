/**
 * External dependencies
 */
import React from 'react';
import styled from '@emotion/styled';
import { useTax, useTotal, renderDisplayValueMarkdown } from '@automattic/composite-checkout';
import { useTranslate } from 'i18n-calypso';

export default function WPCheckoutOrderSummary() {
	const translate = useTranslate();
	const tax = useTax();
	const total = useTotal();

	return (
		<CheckoutSummaryWrapper className="components__checkout-order-summary">
			<WPCheckoutOrderSummaryTitle />
			<CheckoutSummaryAmountWrapper>
				{ tax && (
					<CheckoutSummaryLineItem>
						<CheckoutSummaryLabel>{ translate( 'Taxes' ) }</CheckoutSummaryLabel>
						<CheckoutSummaryAmount>
							{ renderDisplayValueMarkdown( tax.amount.displayValue ) }
						</CheckoutSummaryAmount>
					</CheckoutSummaryLineItem>
				) }
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

function WPCheckoutOrderSummaryTitle() {
	const translate = useTranslate();
	return (
		<CheckoutSummaryTitle>
			<span>{ translate( 'Purchase Details' ) }</span>
		</CheckoutSummaryTitle>
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

const CheckoutSummaryTitle = styled.span`
	display: flex;
	justify-content: space-between;
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
