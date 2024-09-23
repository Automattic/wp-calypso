import styled from '@emotion/styled';

export const PaymentMethodLogos = styled.span`
	display: flex;
	flex: 1;
	flex-wrap: wrap;
	gap: 5px;
	text-align: end;
	align-items: center;
	justify-content: flex-start;

	&.credit-card__logos svg {
		display: inline-block;
		height: 26px;
		width: 42px;
	}

	@media ( ${ ( props ) => props.theme.breakpoints.smallPhoneUp } ) {
		justify-content: flex-end;
	}
`;
