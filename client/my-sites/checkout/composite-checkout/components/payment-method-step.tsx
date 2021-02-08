/**
 * External dependencies
 */
import React from 'react';
import { useShoppingCart } from '@automattic/shopping-cart';
import styled from '@emotion/styled';
import type { LineItem as LineItemType } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import CheckoutTerms from '../components/checkout-terms';
import { NonProductLineItem, WPOrderReviewSection } from './wp-order-review-line-items';
import { getTotalLineItem, getTaxLineItem } from '../lib/translate-cart';

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
	const taxLineItem = getTaxLineItem( responseCart );
	return (
		<>
			{ activeStepContent }

			<CheckoutTermsWrapper>
				<CheckoutTerms cart={ responseCart } />
			</CheckoutTermsWrapper>

			<WPOrderReviewSection>
				{ subtotal && <NonProductLineItem subtotal lineItem={ subtotal } /> }
				{ taxLineItem && <NonProductLineItem tax lineItem={ taxLineItem } /> }
				{ credits && subtotal.amount.value > 0 && (
					<NonProductLineItem subtotal lineItem={ credits } />
				) }
				<NonProductLineItem total lineItem={ getTotalLineItem( responseCart ) } />
			</WPOrderReviewSection>
		</>
	);
}
