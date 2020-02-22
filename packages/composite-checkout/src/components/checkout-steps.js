/**
 * External dependencies
 */
import React, { useState, useContext, useEffect } from 'react';
import styled from '@emotion/styled';
import debugFactory from 'debug';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { useLocalize } from '../lib/localize';
import joinClasses from '../lib/join-classes';
import CheckoutErrorBoundary from './checkout-error-boundary';
import { useFormStatus } from '../lib/form-status';
import LoadingContent from './loading-content';
import CheckoutSubmitButton from './checkout-submit-button';
import Button from './button';
import { CheckIcon } from './shared-icons';

const debug = debugFactory( 'composite-checkout:checkout' );

const CheckoutStepDataContext = React.createContext();
const CheckoutSingleStepDataContext = React.createContext();

export function Checkout( { children, className } ) {
	const { formStatus } = useFormStatus();
	const localize = useLocalize();
	const [ activeStepNumber, setActiveStepNumber ] = useState( 1 );
	const [ stepCompleteStatus, setStepCompleteStatus ] = useState( {} );
	const [ totalSteps, setTotalSteps ] = useState( 0 );
	const isThereAnotherNumberedStep = activeStepNumber < totalSteps;

	if ( formStatus === 'loading' ) {
		return (
			<ContainerUI className={ joinClasses( [ className, 'composite-checkout' ] ) }>
				<MainContentUI
					className={ joinClasses( [ className, 'checkout__content' ] ) }
					isLastStepActive={ false }
				>
					<LoadingContent />
				</MainContentUI>
			</ContainerUI>
		);
	}

	return (
		<ContainerUI className={ joinClasses( [ className, 'composite-checkout' ] ) }>
			<CheckoutStepDataContext.Provider
				value={ {
					activeStepNumber,
					stepCompleteStatus,
					totalSteps,
					setActiveStepNumber,
					setStepCompleteStatus,
					setTotalSteps,
				} }
			>
				<MainContentUI
					className={ joinClasses( [ className, 'checkout__content' ] ) }
					isLastStepActive={ isThereAnotherNumberedStep }
				>
					{ children }

					<SubmittButtonWrapperUI isLastStepActive={ ! isThereAnotherNumberedStep }>
						<CheckoutErrorBoundary
							errorMessage={ localize( 'There was a problem with the submit button.' ) }
						>
							<CheckoutSubmitButton
								disabled={ isThereAnotherNumberedStep || formStatus !== 'ready' }
							/>
						</CheckoutErrorBoundary>
					</SubmittButtonWrapperUI>
				</MainContentUI>
			</CheckoutStepDataContext.Provider>
		</ContainerUI>
	);
}

export function CheckoutSteps( { children } ) {
	let stepNumber = 0;
	let nextStepNumber = 1;
	const totalSteps = React.Children.count( children );
	const {
		activeStepNumber,
		stepCompleteStatus,
		setActiveStepNumber,
		setStepCompleteStatus,
		setTotalSteps,
	} = useContext( CheckoutStepDataContext );

	useEffect( () => {
		setTotalSteps( totalSteps );
	}, [ totalSteps, setTotalSteps ] );

	debug(
		'active step',
		activeStepNumber,
		'step complete status',
		stepCompleteStatus,
		'total steps',
		totalSteps
	);

	return React.Children.map( children, child => {
		stepNumber = nextStepNumber;
		nextStepNumber = stepNumber === totalSteps ? null : stepNumber + 1;
		const isStepActive = activeStepNumber === stepNumber;
		const isStepComplete = !! stepCompleteStatus[ stepNumber ];
		return React.cloneElement( child, {
			stepNumber,
			nextStepNumber,
			isStepActive,
			isStepComplete,
			setActiveStepNumber,
			setStepCompleteStatus: newStatus =>
				setStepCompleteStatus( { ...stepCompleteStatus, [ stepNumber ]: newStatus } ),
		} );
	} );
}

export function CheckoutStep( {
	activeStepContent,
	completeStepContent,
	titleContent,
	stepId,
	isCompleteCallback,
	stepNumber,
	nextStepNumber,
	isStepActive,
	isStepComplete,
	setActiveStepNumber,
	setStepCompleteStatus,
} ) {
	const localize = useLocalize();
	const { totalSteps } = useContext( CheckoutStepDataContext );
	const { setFormPending, setFormReady } = useFormStatus();
	const goToThisStep = () => setActiveStepNumber( stepNumber );
	const goToNextStep = () => {
		const completeResult = isCompleteCallback();
		if ( completeResult.then ) {
			setFormPending();
			completeResult.then( delayedCompleteResult => {
				setStepCompleteStatus( delayedCompleteResult );
				if ( delayedCompleteResult ) {
					setActiveStepNumber( nextStepNumber );
				}
				setFormReady();
			} );
			return;
		}
		setStepCompleteStatus( !! completeResult );
		if ( completeResult ) {
			setActiveStepNumber( nextStepNumber );
		}
		setFormReady();
	};

	const classNames = [
		'checkout-step',
		...( isStepActive ? [ 'checkout-step--is-active' ] : [] ),
		...( isStepComplete ? [ 'checkout-step--is-complete' ] : [] ),
	];

	return (
		<CheckoutErrorBoundary errorMessage={ localize( 'There was an error with this step' ) }>
			<StepWrapperUI
				isActive={ isStepActive }
				isComplete={ isStepComplete }
				className={ joinClasses( classNames ) }
				isFinalStep={ stepNumber === totalSteps }
			>
				<CheckoutSingleStepDataContext.Provider value={ stepNumber }>
					<CheckoutStepHeader
						id={ stepId }
						stepNumber={ stepNumber }
						title={ titleContent }
						isActive={ isStepActive }
						isComplete={ isStepComplete }
						onEdit={ isStepComplete ? goToThisStep : null }
						editButtonAriaLabel={ localize( 'Edit this step' ) }
					/>
					<StepContentUI isVisible={ isStepActive }>{ activeStepContent }</StepContentUI>
					{ isStepComplete ? (
						<StepSummaryUI isVisible={ ! isStepActive }>{ completeStepContent }</StepSummaryUI>
					) : null }
					{ nextStepNumber > 0 ? <CheckoutStepContinueButton onClick={ goToNextStep } /> : null }
				</CheckoutSingleStepDataContext.Provider>
			</StepWrapperUI>
		</CheckoutErrorBoundary>
	);
}

function CheckoutStepContinueButton( { onClick } ) {
	return <Button onClick={ onClick }>Continue</Button>;
}

const ContainerUI = styled.div`
	*:focus {
		outline: ${props => props.theme.colors.outline} solid 2px;
	}
`;

const MainContentUI = styled.div`
	background: ${props => props.theme.colors.surface};
	width: 100%;
	box-sizing: border-box;
	margin-bottom: ${props => ( props.isLastStepActive ? '89px' : 0 )};

	@media ( ${props => props.theme.breakpoints.tabletUp} ) {
		border: 1px solid ${props => props.theme.colors.borderColorLight};
		margin: 32px auto;
		box-sizing: border-box;
		max-width: 556px;
	}
`;

const SubmittButtonWrapperUI = styled.div`
	background: ${props => props.theme.colors.background};
	padding: 24px;
	position: ${props => ( props.isLastStepActive ? 'fixed' : 'relative' )};
	bottom: 0;
	left: 0;
	box-sizing: border-box;
	width: 100%;
	z-index: 10;
	border-top-width: ${props => ( props.isLastStepActive ? '1px' : '0' )};
	border-top-style: solid;
	border-top-color: ${props => props.theme.colors.borderColorLight};

	@media ( ${props => props.theme.breakpoints.tabletUp} ) {
		position: relative;
		border: 0;
	}
`;

export function useIsStepActive() {
	const { activeStepNumber } = useContext( CheckoutStepDataContext );
	const stepNumber = useContext( CheckoutSingleStepDataContext );
	return activeStepNumber === stepNumber;
}

export function useIsStepComplete() {
	const { stepCompleteStatus } = useContext( CheckoutStepDataContext );
	const stepNumber = useContext( CheckoutSingleStepDataContext );
	return !! stepCompleteStatus[ stepNumber ];
}

const StepWrapperUI = styled.div`
	padding-bottom: ${props => ( props.isFinalStep ? '0' : '32px' )};
	position: relative;
	border-bottom: 1px solid ${props => props.theme.colors.borderColorLight};
	padding: 16px;

	@media ( ${props => props.theme.breakpoints.tabletUp} ) {
		padding: 24px;
	}
`;

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
			<StepTitle fullWidth={ ! shouldShowEditButton } isActive={ isActive }>
				{ title }
			</StepTitle>
			{ shouldShowEditButton && (
				<Button buttonState="text-button" onClick={ onEdit } aria-label={ editButtonAriaLabel }>
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

const StepContentUI = styled.div`
	color: ${props => props.theme.colors.textColor};
	display: ${props => ( props.isVisible ? 'block' : 'none' )};
	padding-left: 35px;
`;

const StepSummaryUI = styled.div`
	color: ${props => props.theme.colors.textColorLight};
	font-size: 14px;
	display: ${props => ( props.isVisible ? 'block' : 'none' )};
	padding-left: 35px;
`;
