/* @format */

/**
 * External dependencies
 */
import styled from 'styled-components';

export const Container = styled.div`
	@media ( ${props => props.theme.breakpoints.tabletUp} ) {
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
	@media ( ${props => props.theme.breakpoints.tabletUp} ) {
		border: 1px solid ${props => props.theme.colours.gray5};
		margin-top: 32px;
		box-sizing: border-box;
		padding: 24px;
	}
`;

export const LeftColumn = styled( Column )`
	@media ( ${props => props.theme.breakpoints.tabletUp} ) {
		max-width: 532px;
	}
`;

export const PageTitle = styled.h1`
	margin: 0;
	font-weight: normal;
	font-size: 24px;
	color: ${props => props.theme.colours.black};
`;

export const StepWrapper = styled.div`
	padding-bottom: 32px;
	margin-bottom: 8px;
	position: relative;
	max-height: ${props => ( props.collapsed ? '0' : 'inherit' )};
	overflow: hidden;
	padding: ${props => ( props.collapsed ? '0' : 'inherit' )};
	:after {
		display: block;
		width: ${props => props.theme.borderWidth};
		height: calc( 100% - 35px );
		position: absolute;
		left: 13px;
		top: 35px;
		background: ${props => props.theme.colours.gray20};
		content: '';
	}
	:nth-child( 5 ) {
		padding-bottom: 0;
	}
`;
