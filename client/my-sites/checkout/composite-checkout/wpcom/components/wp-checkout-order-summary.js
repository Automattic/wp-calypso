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

	return (
		<React.Fragment>
			{ domainUrl && <DomainURL>{ domainUrl }</DomainURL> }

			<SummaryContent>
				<ProductList>
					{ items.filter( shouldItemBeInSummary ).map( product => {
						return <ProductListItem key={ product.id }>{ product.label }</ProductListItem>;
					} ) }
				</ProductList>
			</SummaryContent>
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
	word-break: break-word;
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

function shouldItemBeInSummary( item ) {
	const itemTypesToIgnore = [ 'tax', 'credits', 'wordpress-com-credits' ];
	return ! itemTypesToIgnore.includes( item.type );
}
