/**
 * Internal dependencies
 */
import styled from '@emotion/styled';

export const PaymentMethodLogos = styled.span`
	text-align: right;
	transform: translateY( 3px );

	.rtl & {
		text-align: left;
	}

	svg {
		display: block;
	}

	&.google-pay__logo svg {
		height: 16px;
	}
`;
