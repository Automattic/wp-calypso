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
		<>
			<CheckoutSummaryTitle>{ translate( 'Purchase Details' ) }</CheckoutSummaryTitle>
			<CheckoutSummaryAmountWrapper>
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
		</>
	);
}

const CheckoutSummaryTitle = styled.h2`
	color: ${( props ) => props.theme.colors.textColor};
	font-weight: ${( props ) => props.theme.weights.bold};
	padding: 16px;
`;

const CheckoutSummaryAmountWrapper = styled.div`
	border-top: 1px solid ${( props ) => props.theme.colors.borderColorLight};
	padding: 16px;
`;

const CheckoutSummaryLineItem = styled.div`
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
`;

const CheckoutSummaryTotal = styled( CheckoutSummaryLineItem )`
	font-weight: ${( props ) => props.theme.weights.bold};
`;
