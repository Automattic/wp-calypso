import { isChargeback, isCredits } from '@automattic/calypso-products';
import { ResponseCart } from '@automattic/shopping-cart';
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

	.rtl & {
		grid-template-columns: 20px 1fr;
		padding: 10px 80px 10px 20px;

		& li {
			padding: 0;
		}
	}

	@media ( ${ ( props ) => props.theme.breakpoints.bigPhoneUp } ) {
		grid-template-columns: 20px minmax( min-content, 300px ) 70px;
	}

	@media ( ${ ( props ) => props.theme.breakpoints.tabletUp } ) {
		grid-template-columns: 20px minmax( 150px, max-content );
		justify-content: center;
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
