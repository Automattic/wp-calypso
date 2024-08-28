import styled from '@emotion/styled';

export const PaymentMethodLogos = styled.span`
	&.payment-logos {
		display: flex;
		flex: 1;
		transform: translateY( 3px );
		text-align: right;
		align-items: center;
		justify-content: flex-end;
		padding-inline-end: 24px;

		.rtl & {
			text-align: left;
		}

		svg {
			display: inline-block;

			&.has-background {
				padding-inline-end: 5px;
			}
		}
	}
`;
