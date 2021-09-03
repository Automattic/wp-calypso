import styled from '@emotion/styled';
import { pulse } from './animations';

export const CheckoutSummaryLineItem = styled.div`
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	margin-bottom: 4px;

	.is-loading & {
		animation: ${ pulse } 1.5s ease-in-out infinite;
	}
`;

export const CheckoutSummaryTotal = styled( CheckoutSummaryLineItem )`
	font-weight: ${ ( props ) => props.theme.weights.bold };
`;
