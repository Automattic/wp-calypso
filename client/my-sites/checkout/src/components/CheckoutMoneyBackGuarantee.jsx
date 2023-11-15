import styled from '@emotion/styled';
import MaterialIcon from 'calypso/components/material-icon';
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

const StyledMaterialIcon = styled( MaterialIcon )`
	fill: '#1E1E1E';
	margin-right: 0.7em;

	.rtl & {
		margin-right: 0;
		margin-left: 0.7em;
	}
`;

export function CheckoutMoneyBackGuarantee( { cart } ) {
	return (
		<CheckoutMoneyBackGuaranteeWrapper>
			<StyledMaterialIcon icon="credit_card" />
			<CheckoutSummaryRefundWindows cart={ cart } />
		</CheckoutMoneyBackGuaranteeWrapper>
	);
}
