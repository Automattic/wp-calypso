/**
 * External dependencies
 */
import React from 'react';
import { useLineItems } from '@automattic/composite-checkout';
import { useShoppingCart } from '@automattic/shopping-cart';
import styled from '@emotion/styled';
import type { LineItem as LineItemType } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import CheckoutTerms from '../components/checkout-terms';
import { WPOrderReviewTotal, WPOrderReviewSection, LineItem } from './wp-order-review-line-items';
import doesPurchaseHaveFullCredits from '../lib/does-purchase-have-full-credits';

const CheckoutTermsWrapper = styled.div`
	& > * {
		margin: 16px 0 16px -24px;
		padding-left: 24px;
		position: relative;
	}

	.rtl & > * {
		margin: 16px -24px 16px 0;
		padding-right: 24px;
		padding-left: 0;
	}

	& div:first-of-type {
		padding-right: 0;
		padding-left: 0;
		margin-right: 0;
		margin-left: 0;
		margin-top: 32px;
	}

	svg {
		width: 16px;
		height: 16px;
		position: absolute;
		top: 0;
		left: 0;

		.rtl & {
			left: auto;
			right: 0;
		}
	}

	p {
		font-size: 12px;
		margin: 0;
		word-break: break-word;
	}

	a {
		text-decoration: underline;
	}

	a:hover {
		text-decoration: none;
	}
`;

export default function PaymentMethodStep( {
	subtotal,
	credits,
	activeStepContent,
}: {
	subtotal: LineItemType;
	credits: LineItemType;
	activeStepContent: JSX.Element;
} ): JSX.Element {
	const { responseCart } = useShoppingCart();
	const [ items, total ] = useLineItems();
	const isFullCredits = doesPurchaseHaveFullCredits( responseCart );
	// NOTE: if we have full credits, we currently do not charge taxes. This may not be ideal, but it's how the back-end works.
	const taxes = isFullCredits ? [] : items.filter( ( item ) => item.type === 'tax' );
	return (
		<>
			{ activeStepContent }

			<CheckoutTermsWrapper>
				<CheckoutTerms cart={ responseCart } />
			</CheckoutTermsWrapper>

			<WPOrderReviewSection>
				{ subtotal && <LineItem subtotal item={ subtotal } /> }
				{ taxes.map( ( tax ) => (
					<LineItem tax key={ tax.id } item={ tax } />
				) ) }
				{ credits && <LineItem subtotal item={ credits } /> }
				<WPOrderReviewTotal total={ isFullCredits ? subtotal : total } />
			</WPOrderReviewSection>
		</>
	);
}
