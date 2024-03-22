import { isChargeback, isCredits } from '@automattic/calypso-products';
import styled from '@emotion/styled';
import { CheckoutSummaryRefundWindows } from './wp-checkout-order-summary';

const CheckoutMoneyBackGuaranteeWrapper = styled.div`
	display: grid;
	grid-template-columns: 20px 1fr 70px;
	column-gap: 1em;
	align-items: center;
	margin: 1.5em 0 0;

	& li {
		list-style: none;
		font-size: 14px;
		margin-bottom: 0;
		padding: 0;
		svg {
			display: none;
		}
	}

	@media ( ${ ( props ) => props.theme.breakpoints.tabletUp } ) {
		grid-template-columns: 20px minmax( 150px, max-content );
		justify-content: center;
		margin: 1.5em 0 0;
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
