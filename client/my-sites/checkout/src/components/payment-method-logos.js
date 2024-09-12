import styled from '@emotion/styled';

export const PaymentMethodLogos = styled.span`
	display: flex;
	flex: 1;
	text-align: right;
	align-items: center;
	justify-content: flex-end;

	.rtl & {
		text-align: left;
	}

	svg {
		display: inline-block;

		&.has-background {
			padding-inline-end: 5px;
		}
	}
`;
