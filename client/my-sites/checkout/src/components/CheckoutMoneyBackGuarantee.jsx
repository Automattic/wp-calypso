import styled from '@emotion/styled';
import { Icon, reusableBlock } from '@wordpress/icons';
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

	@media ( ${ ( props ) => props.theme.breakpoints.tabletUp } ) {
		justify-content: flex-start;
	}
`;

const StyledIcon = styled( Icon )`
	fill: '#1E1E1E';
	margin-right: 0.3em;

	.rtl & {
		margin-right: 0;
		margin-left: 0.3em;
	}
`;

export function CheckoutMoneyBackGuarantee( { cart } ) {
	const allCartItemsAreDomains = cart.products.every(
		( product ) => product.is_domain_registration === true
	);

	return (
		! allCartItemsAreDomains && (
			<CheckoutMoneyBackGuaranteeWrapper>
				<StyledIcon icon={ reusableBlock } size={ 24 } />
				<CheckoutSummaryRefundWindows cart={ cart } />
			</CheckoutMoneyBackGuaranteeWrapper>
		)
	);
}
