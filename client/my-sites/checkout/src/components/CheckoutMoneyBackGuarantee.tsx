import { isChargeback, isCredits } from '@automattic/calypso-products';
import { ResponseCart } from '@automattic/shopping-cart';
import styled from '@emotion/styled';
import { CheckoutSummaryRefundWindows } from './wp-checkout-order-summary';

const CheckoutMoneyBackGuaranteeWrapper = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	margin: 1.5em 0 0;

	& li {
		list-style: none;
		font-size: 14px;
		margin: 0 0 0 0.5rem;
		padding: 0;
	}
`;

export function CheckoutMoneyBackGuarantee( { cart }: { cart: ResponseCart } ) {
	// Return early if the cart is only Chargebacks fees
	if ( cart.products.every( isChargeback || isCredits ) ) {
		return null;
	}

	const allCartItemsAreDomains = cart.products.every(
		( product ) => product.is_domain_registration === true
	);

	return (
		! allCartItemsAreDomains && (
			<CheckoutMoneyBackGuaranteeWrapper>
				<CheckoutSummaryRefundWindows cart={ cart } includeRefundIcon />
			</CheckoutMoneyBackGuaranteeWrapper>
		)
	);
}
