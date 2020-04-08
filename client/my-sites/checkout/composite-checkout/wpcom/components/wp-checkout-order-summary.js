/**
 * External dependencies
 */
import React from 'react';
import styled from '@emotion/styled';
import { useLineItems, useTotal, renderDisplayValueMarkdown } from '@automattic/composite-checkout';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { isLineItemADomain } from '../hooks/has-domains';

export default function WPCheckoutOrderSummary( { siteUrl } ) {
	const [ items ] = useLineItems();

	const firstDomainItem = items.find( isLineItemADomain );
	const domainUrl = firstDomainItem ? firstDomainItem.sublabel : siteUrl;

	return <React.Fragment>{ domainUrl && <DomainURL>{ domainUrl }</DomainURL> }</React.Fragment>;
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
	word-break: break-word;
`;
