/**
 * External dependencies
 */
import React from 'react';
import styled from '@emotion/styled';

/**
 * Internal dependencies
 */
import { useLineItems, useTotal, renderDisplayValueMarkdown } from '../public-api';
import { useLocalize } from '../lib/localize';

export default function CheckoutOrderSummary() {
	const [ items ] = useLineItems();

	return (
		<ProductList>
			{ items.map( product => {
				return <ProductListItem key={ product.id }>{ product.label }</ProductListItem>;
			} ) }
		</ProductList>
	);
}

const ProductList = styled.ul`
	margin: 0;
	padding: 0;
`;

const ProductListItem = styled.li`
	margin: 0;
	padding: 0;
	list-style-type: none;
`;

export function CheckoutOrderSummaryTitle() {
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
