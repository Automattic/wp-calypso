/**
 * External dependencies
 */
import React from 'react';
import styled from '@emotion/styled';
import { useTotal, renderDisplayValueMarkdown } from '@automattic/composite-checkout';
import { useTranslate } from 'i18n-calypso';

export default function WPCheckoutOrderSummary() {
	return (
		<React.Fragment>
			<WPCheckoutOrderSummaryTitle />
		</React.Fragment>
	);
}

function WPCheckoutOrderSummaryTitle() {
	const translate = useTranslate();
	const total = useTotal();
	return (
		<CheckoutSummaryTitle>
			<span>{ translate( 'Purchase Details' ) }</span>
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
	font-weight: ${( props ) => props.theme.weights.bold};
`;
