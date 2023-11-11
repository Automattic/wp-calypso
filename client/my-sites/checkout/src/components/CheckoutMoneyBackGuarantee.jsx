import styled from '@emotion/styled';
import MaterialIcon from 'calypso/components/material-icon';
import { CheckoutSummaryRefundWindows } from './wp-checkout-order-summary';

export function CheckoutMoneyBackGuarantee( { cart } ) {
	const CheckoutMoneyBackGuaranteeWrapper = styled.div`
		display: flex;
		align-items: center;
		margin-bottom: 2em;
		align-self: flex-start;
		padding-left: 40px;

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

	const StyledMaterialIcon = styled( MaterialIcon )`
		fill: '#1E1E1E';
		margin-right: 0.7em;

		.rtl & {
			margin-right: 0;
			margin-left: 0.7em;
		}
	`;

	return (
		<CheckoutMoneyBackGuaranteeWrapper>
			<StyledMaterialIcon icon="credit_card" />
			<CheckoutSummaryRefundWindows cart={ cart } />
		</CheckoutMoneyBackGuaranteeWrapper>
	);
}
