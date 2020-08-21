/**
 * Internal dependencies
 */
import styled from '../styled';

export const PaymentMethodLogos = styled.span`
	flex: 1;
	transform: translateY( 3px );
	text-align: right;

	.rtl & {
		text-align: left;
	}

	svg {
		display: inline-block;
	}
`;
