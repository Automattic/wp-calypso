/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';

/**
 * Internal dependencies
 */
import joinClasses from '../lib/join-classes';
import { useLocalize } from '../lib/localize';
import Button from './button';
import { CheckIcon } from './shared-icons';

export default function CheckoutStep( {
	id,
	className,
	stepNumber,
	title,
	onEdit,
	isActive,
	isComplete,
	finalStep,
	stepSummary,
	stepContent,
	editButtonAriaLabel,
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
				id={ id }
				stepNumber={ stepNumber }
				title={ title }
				isActive={ isActive }
				isComplete={ isComplete }
				onEdit={ onEdit }
				editButtonAriaLabel={ editButtonAriaLabel }
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
	id: PropTypes.string,
	className: PropTypes.string,
	stepNumber: PropTypes.number,
	title: PropTypes.node.isRequired,
	finalStep: PropTypes.bool,
	stepSummary: PropTypes.node,
	stepContent: PropTypes.node,
	isActive: PropTypes.bool.isRequired,
	isComplete: PropTypes.bool.isRequired,
};

function CheckoutStepHeader( {
	id,
	className,
	stepNumber,
	title,
	isActive,
	isComplete,
	onEdit,
	editButtonAriaLabel,
} ) {
	const localize = useLocalize();
	const shouldShowEditButton = !! onEdit;

	return (
		<StepHeader
			isComplete={ isComplete }
			isActive={ isActive }
			className={ joinClasses( [ className, 'checkout-step__header' ] ) }
		>
			<Stepper isComplete={ isComplete } isActive={ isActive } id={ id }>
				{ stepNumber || null }
			</Stepper>
			<StepTitle
				className="checkout-step__title"
				fullWidth={ ! shouldShowEditButton }
				isActive={ isActive }
			>
				{ title }
			</StepTitle>
			{ shouldShowEditButton && (
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
	id: PropTypes.string,
	className: PropTypes.string,
	title: PropTypes.node.isRequired,
	isActive: PropTypes.bool,
	isComplete: PropTypes.bool,
	onEdit: PropTypes.func,
};

function Stepper( { isComplete, isActive, className, children, id } ) {
	// Prevent showing complete stepper when active
	const isCompleteAndInactive = isActive ? false : isComplete;
	return (
		<StepNumberOuterWrapper className={ joinClasses( [ className, 'checkout-step__stepper' ] ) }>
			<StepNumberInnerWrapper isComplete={ isCompleteAndInactive }>
				<StepNumber isComplete={ isCompleteAndInactive } isActive={ isActive }>
					{ children }
				</StepNumber>
				<StepNumberCompleted>
					<CheckIcon id={ id } />
				</StepNumberCompleted>
			</StepNumberInnerWrapper>
		</StepNumberOuterWrapper>
	);
}

Stepper.propTypes = {
	id: PropTypes.string,
	className: PropTypes.string,
	isComplete: PropTypes.bool,
	isActive: PropTypes.bool,
};

const StepWrapper = styled.div`
	padding-bottom: ${props => ( props.finalStep ? '0' : '32px' )};
	position: relative;
	border-bottom: 1px solid ${props => props.theme.colors.borderColorLight};
	padding: 16px;

	@media ( ${props => props.theme.breakpoints.tabletUp} ) {
		padding: 24px;
	}
`;

const StepTitle = styled.span`
	color: ${props =>
		props.isActive ? props.theme.colors.textColorDark : props.theme.colors.textColor};
	font-weight: ${props =>
		props.isActive ? props.theme.weights.bold : props.theme.weights.normal};
	margin-right: ${props => ( props.fullWidth ? '0' : '8px' )};
	flex: ${props => ( props.fullWidth ? '1' : 'inherit' )};
`;

const StepHeader = styled.h2`
	font-size: 16px;
	display: flex;
	width: 100%;
	align-items: center;
	margin: 0 0 ${props => ( props.isComplete || props.isActive ? '8px' : '0' )};
`;

const StepNumberOuterWrapper = styled.div`
	position: relative;
	width: 27px;
	height: 27px;
	margin-right: 8px;
`;

const StepNumberInnerWrapper = styled.div`
	position: relative;
	transform-origin: center center;
	transition: transform 0.3s 0.1s ease-out;
	transform-style: preserve-3d;
	transform: ${props => ( props.isComplete ? 'rotateY(180deg)' : 'rotateY(0)' )};
`;

const StepNumber = styled.div`
	background: ${ getStepNumberBackgroundColor };
	font-weight: normal;
	width: 27px;
	height: 27px;
	line-height: 27px;
	box-sizing: border-box;
	text-align: center;
	border-radius: 50%;
	color: ${ getStepNumberForegroundColor };
	position: absolute;
	top: 0;
	left: 0;
	backface-visibility: hidden;
	// Reason: The IE media query needs to not have spaces within brackets otherwise ie11 doesn't read them
	// prettier-ignore
	@media all and (-ms-high-contrast:none), (-ms-high-contrast:active) {
		z-index: ${ props => ( props.isComplete ? '0' : '1' ) };
	}
`;

const StepNumberCompleted = styled( StepNumber )`
	background: ${ props => props.theme.colors.success };
	transform: rotateY( 180deg );
	// Reason: media query needs to not have spaces within brackets otherwise ie11 doesn't read them
	// prettier-ignore
	@media all and (-ms-high-contrast:none), (-ms-high-contrast:active) {
		backface-visibility: visible;
		z-index: ${ props => ( props.isComplete ? '1' : '0' ) };
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
