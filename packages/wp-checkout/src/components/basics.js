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
	padding-bottom: 24px;
`;

export const StepWrapper = styled.div`
	padding-bottom: 32px;
	margin-bottom: 8px;
	position: relative;
	max-height: ${props => ( props.collapsed ? '0' : 'initial' )};
	overflow: hidden;
	padding: ${props => ( props.collapsed ? '0' : 'initial' )};
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

export const StepHeader = styled.h2`
	font-size: 16px;
	display: flex;
	width: 100%;
	align-items: center;
	margin: 0 0 8px;
`;

export const StepTitle = styled.span`
	font-weight: ${props =>
		props.collapsed ? props.theme.weights.normal : props.theme.weights.bold};
	color: ${props => ( props.collapsed ? props.theme.colours.gray80 : props.theme.colours.black )};
	margin-right: 5px;
`;

export const StepNumber = styled.span`
	background: ${props =>
		props.collapsed ? props.theme.colours.gray5 : props.theme.colours.highlight};
	font-weight: normal;
	width: 27px;
	height: 27px;
	box-sizing: border-box;
	padding: 0;
	text-align: center;
	display: block;
	border-radius: 50%;
	margin-right: 8px;
	color: ${props => ( props.collapsed ? props.theme.colours.gray80 : props.theme.colours.white )};
	position: relative;
	line-height: 27px;
	:after {
		position: absolute;
		top: 0;
		left: 0;
		border: 2px solid
			${props => ( props.collapsed ? props.theme.colours.gray5 : props.theme.colours.highlight )};
		content: '';
		display: block;
		width: 27px;
		height: 27px;
		border-radius: 50%;
		box-sizing: border-box;
	}
	svg {
		margin-top: 4px;
	}
`;

export const StepContent = styled.div`
	color: ${props => props.theme.colours.gray80};
	padding-left: 35px;
`;
