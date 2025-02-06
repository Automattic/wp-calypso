import { isChargeback, isCredits } from '@automattic/calypso-products';
import { ResponseCart } from '@automattic/shopping-cart';
import styled from '@emotion/styled';
import { CheckoutSummaryRefundWindows } from './wp-checkout-order-summary';

const CheckoutMoneyBackGuaranteeWrapper = styled.div`
	& li {
		display: flex;
		align-items: center;
		justify-content: center;
		list-style: none;
		font-size: 14px;
		padding: 0;
		margin: 0;
		gap: 0.5rem;

		& svg {
			margin: 0;
		}
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
