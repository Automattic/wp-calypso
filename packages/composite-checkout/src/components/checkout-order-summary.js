/**
 * External dependencies
 */
import React from 'react';
import styled from '@emotion/styled';

/**
 * Internal dependencies
 */
import {
	CheckoutSummaryCard,
	useLineItems,
	useLineItemsOfType,
	useTotal,
	renderDisplayValueMarkdown,
} from '../public-api';
import { useLocalize } from '../lib/localize';
import { useTranslate } from 'i18n-calypso';

export default function CheckoutOrderSummaryStep() {
	const [ items ] = useLineItems();

	return (
		<ProductList>
			{ items.map( ( product ) => {
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

export function CheckoutOrderSummaryStepTitle() {
	const localize = useLocalize();
	const total = useTotal();
	return (
		<CheckoutSummaryStepTitle>
			<span>{ localize( 'You are all set to check out' ) }</span>
			<CheckoutSummaryStepTotal>
				{ renderDisplayValueMarkdown( total.amount.displayValue ) }
			</CheckoutSummaryStepTotal>
		</CheckoutSummaryStepTitle>
	);
}

const CheckoutSummaryStepTitle = styled.span`
	display: flex;
	justify-content: space-between;
`;

const CheckoutSummaryStepTotal = styled.span`
	font-weight: ${( props ) => props.theme.weights.bold};
`;

export function CheckoutOrderSummary() {
	const translate = useTranslate();
	const taxes = useLineItemsOfType( 'tax' );
	const total = useTotal();

	return (
		<CheckoutSummaryCard>
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
		</CheckoutSummaryCard>
	);
}

const CheckoutSummaryTitle = styled.div`
	color: ${( props ) => props.theme.colors.textColor};
	font-weight: ${( props ) => props.theme.weights.bold};
	padding: 24px 20px;
`;

const CheckoutSummaryAmountWrapper = styled.div`
	border-top: 1px solid ${( props ) => props.theme.colors.borderColorLight};
	padding: 24px 20px;
`;

const CheckoutSummaryLineItem = styled.div`
	display: flex;
	justify-content: space-between;
`;

const CheckoutSummaryTotal = styled( CheckoutSummaryLineItem )`
	font-weight: ${( props ) => props.theme.weights.bold};
`;
