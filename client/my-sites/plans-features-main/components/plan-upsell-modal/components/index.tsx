import { Button } from '@automattic/components';
import styled from '@emotion/styled';

export const DialogContainer = styled.div`
	padding: 24px 12px;
	@media ( min-width: 780px ) {
		padding: 24px;
	}
`;

export const Heading = styled.div< { shrinkMobileFont?: boolean } >`
	font-family: Recoleta;
	color: var( --studio-gray-100 );
	font-size: ${ ( { shrinkMobileFont } ) => ( shrinkMobileFont ? '22px' : '32px' ) };
	line-height: 26px;
	letter-spacing: 0.38px;
	@media ( min-width: 780px ) {
		font-size: 32px;
		line-height: 40px;
		letter-spacing: -0.32px;
	}
`;

export const SubHeading = styled.div`
	margin-top: 8px;
	font-family: 'SF Pro Text', sans-serif;
	color: var( --studio-gray-60 );
	font-size: 14px;
	line-height: 20px;
	letter-spacing: -0.15px;
	@media ( min-width: 780px ) {
		font-size: 16px;
		line-height: 24px;
		letter-spacing: -0.1px;
	}
`;

export const ButtonContainer = styled.div`
	display: flex;
	flex-direction: column;
	margin-top: 16px;
	@media ( min-width: 780px ) {
		margin-top: 24px;
	}
`;

export const Row = styled.div`
	display: flex;
	justify-content: space-between;
	padding-top: 16px;
	flex-wrap: wrap;
	gap: 12px;
	flex-direction: column;
	@media ( min-width: 780px ) {
		flex-direction: row;
		align-items: center;
	}
`;

export const RowWithBorder = styled( Row )`
	border-bottom: 1px solid rgba( 220, 220, 222, 0.64 );
	padding-bottom: 16px;
`;

export const DomainName = styled.div`
	font-size: 16px;
	line-height: 20px;
	letter-spacing: -0.24px;
	color: var( --studio-gray-80 );
	overflow-wrap: break-word;
	max-width: 100%;
	@media ( min-width: 780px ) {
		max-width: 55%;
	}
`;

export const StyledButton = styled( Button )< { maxwidth?: string } >`
	padding: 10px 24px;
	border-radius: 4px;
	font-weight: 500;
	font-size: 14px;
	line-height: 20px;
	flex: 1;
	&.is-primary,
	&.is-primary.is-busy,
	&.is-primary:hover,
	&.is-primary:focus {
		background-color: var( --studio-blue-50 );
		border: unset;
	}
	&:hover {
		opacity: 0.85;
		transition: 0.7s;
	}
	&:focus:not( .is-borderless ) {
		box-shadow:
			0 0 0 2px var( --studio-white ),
			0 0 0 4px var( --studio-blue-50 );
	}
	width: 100%;

	&.is-borderless {
		text-decoration: underline;
		border: none;
		font-weight: 600;
		padding: 0px;
		color: var( --studio-gray-50 );
	}

	&:first-of-type {
		margin-bottom: 20px;
	}
	@media ( min-width: 780px ) {
		max-width: ${ ( { maxwidth } ) => maxwidth ?? 'fit-content' };
		width: unset;
		&:first-of-type {
			margin-bottom: 0;
		}
		&:nth-of-type( 2 ) {
			margin-left: 31.5px;
		}
	}
`;
