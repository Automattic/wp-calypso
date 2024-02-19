import { isChargeback, isCredits } from '@automattic/calypso-products';
import styled from '@emotion/styled';
import { CheckoutSummaryRefundWindows } from './wp-checkout-order-summary';

const CheckoutMoneyBackGuaranteeWrapper = styled.div`
	display: flex;
	align-items: center;
	margin: 1em 0;
	align-self: flex-start;
	margin: 1em 0 0;
	justify-content: center;

	& li {
		list-style: none;
		padding-left: 0;
		font-size: 14px;
		margin: 0;

		svg {
			display: none;
		}
	}
`;

export function CheckoutMoneyBackGuarantee( { cart } ) {
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
