/* @format */

/**
 * External dependencies
 */
import styled from 'styled-components';

/**
 * Internal dependencies
 */
import Field from './field';

export const Container = styled.div`
	@media ( ${props => props.theme.breakpoints.tabletUp} ) {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		max-width: 910px;
		margin: 0 auto;
	}

	*:focus {
		outline: ${props => props.theme.colors.outline} auto 5px;
	}
`;

const Column = styled.div`
	background: ${props => props.theme.colors.white};
	padding: 16px;
	width: 100%;
	box-sizing: border-box;
	@media ( ${props => props.theme.breakpoints.tabletUp} ) {
		border: 1px solid ${props => props.theme.colors.gray5};
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
	color: ${props => props.theme.colors.black};
	padding-bottom: 24px;
`;

export const StepWrapper = styled.div`
	padding-bottom: 32px;
	margin-bottom: 8px;
	position: relative;

	:after {
		display: block;
		width: ${props => ( props.finalStep ? '0' : '1px' )};
		height: calc( 100% - 35px );
		position: absolute;
		left: 13px;
		top: 35px;
		background: ${props => props.theme.colors.gray20};
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
	color: ${props => ( props.isActive ? props.theme.colors.black : props.theme.colors.gray80 )};
	margin-right: 5px;
	font-weight: ${props =>
		props.isActive ? props.theme.weights.bold : props.theme.weights.normal};
`;

function getStepNumberBackgroundColor( { isComplete, isActive, theme } ) {
	if ( isActive ) {
		return theme.colors.highlight;
	}
	if ( isComplete ) {
		return theme.colors.white;
	}
	return theme.colors.gray5;
}

function getStepNumberForegroundColor( { isComplete, isActive, theme } ) {
	if ( isComplete || isActive ) {
		return theme.colors.white;
	}
	return theme.colors.gray80;
}

function getStepNumberBorderColor( { isComplete, isActive, theme } ) {
	if ( isActive ) {
		return theme.colors.highlight;
	}
	if ( isComplete ) {
		return theme.colors.green50;
	}
	return theme.colors.gray5;
}

export const StepNumber = styled.span`
	background: ${getStepNumberBackgroundColor};
	font-weight: normal;
	width: 27px;
	height: 27px;
	box-sizing: border-box;
	padding: 0;
	text-align: center;
	display: block;
	border-radius: 50%;
	margin-right: 8px;
	color: ${getStepNumberForegroundColor};
	position: relative;
	line-height: 27px;
	:after {
		position: absolute;
		top: 0;
		left: 0;
		border: 2px solid ${getStepNumberBorderColor};
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
	color: ${props => props.theme.colors.gray80};
	display: ${props => ( props.isActive ? 'block' : 'none' )};
	padding-left: 35px;
`;

export const StepSummary = styled.div`
	color: ${props => props.theme.colors.gray50};
	font-size: 14px;
	display: ${props => ( props.showSummary ? 'block' : 'none' )};
	padding-left: 35px;
`;

export const BillingFormFields = styled.div`
	margin-bottom: 16px;
`;

export const FormField = styled( Field )`
	margin-top: 16px;
	:first-child {
		margin-top: 0;
	}
`;

export const RadioButtons = styled.div`
	margin-bottom: 16px;
`;
