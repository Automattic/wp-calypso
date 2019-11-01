/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

/**
 * Internal dependencies
 */
import joinClasses from '../lib/join-classes';
import { useLocalize } from '../lib/localize';
import Button from './button';

export default function CheckoutStep( {
	className,
	stepNumber,
	title,
	onEdit,
	isActive,
	isComplete,
	finalStep,
	stepSummary,
	stepContent,
} ) {
	const classNames = [
		className,
		'checkout-step',
		...( isActive ? [ 'checkout-step--is-active' ] : [] ),
		...( isComplete ? [ 'checkout-step--is-complete' ] : [] ),
	];
	return (
		<StepWrapper
			isActive={ isActive }
			isComplete={ isComplete }
			className={ joinClasses( classNames ) }
			finalStep={ finalStep }
		>
			<CheckoutStepHeader
				stepNumber={ stepNumber }
				title={ title }
				isActive={ isActive }
				isComplete={ isComplete }
				onEdit={ onEdit }
			/>
			<StepContent className="checkout-step__content" isVisible={ isActive }>
				{ stepContent }
			</StepContent>
			{ stepSummary && (
				<StepSummary className="checkout-step__summary" isVisible={ ! isActive }>
					{ stepSummary }
				</StepSummary>
			) }
		</StepWrapper>
	);
}

CheckoutStep.propTypes = {
	className: PropTypes.string,
	stepNumber: PropTypes.number.isRequired,
	title: PropTypes.string.isRequired,
	finalStep: PropTypes.bool,
	stepSummary: PropTypes.node,
	stepContent: PropTypes.node.isRequired,
	isActive: PropTypes.bool.isRequired,
	isComplete: PropTypes.bool.isRequired,
};

function CheckoutStepHeader( {
	className,
	stepNumber,
	title,
	isActive,
	isComplete,
	onEdit,
	editButtonAriaLabel,
} ) {
	const localize = useLocalize();
	return (
		<StepHeader
			isComplete={ isComplete }
			isActive={ isActive }
			className={ joinClasses( [ className, 'checkout-step__header' ] ) }
		>
			<Stepper isComplete={ isComplete } isActive={ isActive }>
				{ isComplete ? <CheckIcon /> : stepNumber }
			</Stepper>
			<StepTitle className="checkout-step__title" isActive={ isActive }>
				{ title }
			</StepTitle>
			{ onEdit && isComplete && ! isActive && (
				<Button
					buttonState="text-button"
					className="checkout-step__edit"
					onClick={ onEdit }
					aria-label={ editButtonAriaLabel }
				>
					{ localize( 'Edit' ) }
				</Button>
			) }
		</StepHeader>
	);
}

CheckoutStepHeader.propTypes = {
	className: PropTypes.string,
	stepNumber: PropTypes.number.isRequired,
	title: PropTypes.string.isRequired,
	isActive: PropTypes.bool,
	isComplete: PropTypes.bool,
	onEdit: PropTypes.func,
};

function Stepper( { isComplete, isActive, className, children } ) {
	return (
		<StepNumber
			isComplete={ isComplete }
			isActive={ isActive }
			className={ joinClasses( [ className, 'checkout-step__stepper' ] ) }
		>
			{ children }
		</StepNumber>
	);
}

Stepper.propTypes = {
	className: PropTypes.string,
	isComplete: PropTypes.bool,
	isActive: PropTypes.bool,
};

function CheckIcon() {
	return (
		<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
			<mask
				id="mask1"
				mask-type="alpha"
				maskUnits="userSpaceOnUse"
				x="2"
				y="4"
				width="16"
				height="12"
			>
				<path
					d="M7.32916 13.2292L3.85416 9.75417L2.67083 10.9292L7.32916 15.5875L17.3292 5.58751L16.1542 4.41251L7.32916 13.2292Z"
					fill="white"
				/>
			</mask>
			<g mask="url(#mask1)">
				<rect width="20" height="20" fill="white" />
			</g>
		</svg>
	);
}

const StepWrapper = styled.div`
	padding-bottom: ${props => ( props.finalStep ? '0' : '32px' )};
	position: relative;
	border-bottom: ${props => ( props.finalStep ? '0' : '1px' )} solid
		${props => props.theme.colors.borderColorLight};
	padding: 16px;

	@media ( ${props => props.theme.breakpoints.tabletUp} ) {
		padding: 24px;
	}
`;

const StepTitle = styled.span`
	color: ${props =>
		props.isActive ? props.theme.colors.textColorDark : props.theme.colors.textColor};
	margin-right: 5px;
	font-weight: ${props =>
		props.isActive ? props.theme.weights.bold : props.theme.weights.normal};
`;

const StepHeader = styled.h2`
	font-size: 16px;
	display: flex;
	width: 100%;
	align-items: center;
	margin: 0 0 ${props => ( props.isComplete || props.isActive ? '8px' : '0' )};
`;

const StepNumber = styled.span`
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

function getStepNumberBackgroundColor( { isComplete, isActive, theme } ) {
	if ( isActive ) {
		return theme.colors.highlight;
	}
	if ( isComplete ) {
		return theme.colors.success;
	}
	return theme.colors.upcomingStepBackground;
}

function getStepNumberForegroundColor( { isComplete, isActive, theme } ) {
	if ( isComplete || isActive ) {
		return theme.colors.surface;
	}
	return theme.colors.textColor;
}

const StepContent = styled.div`
	color: ${props => props.theme.colors.textColor};
	display: ${props => ( props.isVisible ? 'block' : 'none' )};
	padding-left: 35px;
`;

const StepSummary = styled.div`
	color: ${props => props.theme.colors.textColorLight};
	font-size: 14px;
	display: ${props => ( props.isVisible ? 'block' : 'none' )};
	padding-left: 35px;
`;
