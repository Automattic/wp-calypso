/* @format */

/**
 * External dependencies
 */
import styled from 'styled-components';

export const Container = styled.div`
	@media (${props => props.theme.breakpoints.tabletUp}) {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		max-width: 910px;
		margin: 0 auto;
	}
`;

const Column = styled.div`
	background: ${props => props.theme.colours.white};
	padding: 16px;
	width: 100%;
	box-sizing: border-box;
	@media (${props => props.theme.breakpoints.tabletUp}) {
		border: 1px solid ${props => props.theme.colours.gray5};
		margin-top: 32px;
		box-sizing: border-box;
		padding: 24px;
	}
`;

export const LeftColumn = styled(Column)`
	@media (${props => props.theme.breakpoints.tabletUp}) {
		max-width: 532px;
	}
`;

export const PageTitle = styled.h1`
	margin: 0;
	font-weight: normal;
	font-size: 24px;
	color: ${props => props.theme.colours.black};
`;
