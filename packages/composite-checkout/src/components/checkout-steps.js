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
import CheckoutNextStepButton from './checkout-next-step-button';
import {
	getDefaultOrderReviewStep,
	getDefaultOrderSummaryStep,
	getDefaultPaymentMethodStep,
	usePaymentMethod,
} from '../public-api';

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

	const getDefaultCheckoutSteps = () => <DefaultCheckoutSteps />;

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
					{ children || getDefaultCheckoutSteps() }

					<SubmitButtonWrapperUI isLastStepActive={ ! isThereAnotherNumberedStep }>
						<CheckoutErrorBoundary
							errorMessage={ localize( 'There was a problem with the submit button.' ) }
						>
							<CheckoutSubmitButton
								disabled={ isThereAnotherNumberedStep || formStatus !== 'ready' }
							/>
						</CheckoutErrorBoundary>
					</SubmitButtonWrapperUI>
				</MainContentUI>
			</CheckoutStepDataContext.Provider>
		</ContainerUI>
	);
}

function DefaultCheckoutSteps() {
	const activePaymentMethod = usePaymentMethod();
	const orderSummaryStep = getDefaultOrderSummaryStep();
	const paymentMethodStep = getDefaultPaymentMethodStep();
	const reviewOrderStep = getDefaultOrderReviewStep();
	return (
		<React.Fragment>
			<CheckoutStepBody
				activeStepContent={ orderSummaryStep.activeStepContent }
				completeStepContent={ orderSummaryStep.completeStepContent }
				titleContent={ orderSummaryStep.titleContent }
				errorMessage={ 'There was an error with this step.' }
				isStepActive={ false }
				isStepComplete={ true }
				stepNumber={ 1 }
				totalSteps={ 1 }
				stepId={ 'order-summary' }
				className={ orderSummaryStep.className }
			/>
			<CheckoutSteps>
				<CheckoutStep
					stepId="payment-method-step"
					isCompleteCallback={ () =>
						paymentMethodStep.isCompleteCallback( { activePaymentMethod } )
					}
					activeStepContent={ paymentMethodStep.activeStepContent }
					completeStepContent={ paymentMethodStep.completeStepContent }
					titleContent={ paymentMethodStep.titleContent }
					className={ paymentMethodStep.className }
				/>
				<CheckoutStep
					stepId="review-order-step"
					isCompleteCallback={ () => true }
					activeStepContent={ reviewOrderStep.activeStepContent }
					completeStepContent={ reviewOrderStep.completeStepContent }
					titleContent={ reviewOrderStep.titleContent }
					className={ reviewOrderStep.className }
				/>
			</CheckoutSteps>
		</React.Fragment>
	);
}

export function CheckoutSteps( { children } ) {
	let stepNumber = 0;
	let nextStepNumber = 1;
	const totalSteps = React.Children.count( children );
	const { activeStepNumber, stepCompleteStatus, setTotalSteps } = useContext(
		CheckoutStepDataContext
	);

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
		return (
			<CheckoutSingleStepDataContext.Provider
				value={ {
					stepNumber,
					nextStepNumber,
					isStepActive,
					isStepComplete,
				} }
			>
				{ child }
			</CheckoutSingleStepDataContext.Provider>
		);
	} );
}

export function CheckoutStep( {
	activeStepContent,
	completeStepContent,
	titleContent,
	stepId,
	className,
	isCompleteCallback,
	editButtonText,
	editButtonAriaLabel,
	nextStepButtonText,
	nextStepButtonAriaLabel,
	validatingButtonText,
	validatingButtonAriaLabel,
} ) {
	const localize = useLocalize();
	const { totalSteps, setActiveStepNumber, setStepCompleteStatus, stepCompleteStatus } = useContext(
		CheckoutStepDataContext
	);
	const { stepNumber, nextStepNumber, isStepActive, isStepComplete } = useContext(
		CheckoutSingleStepDataContext
	);
	const { formStatus, setFormValidating, setFormReady } = useFormStatus();
	const setThisStepCompleteStatus = newStatus =>
		setStepCompleteStatus( { ...stepCompleteStatus, [ stepNumber ]: newStatus } );
	const goToThisStep = () => setActiveStepNumber( stepNumber );
	const finishIsCompleteCallback = completeResult => {
		setThisStepCompleteStatus( !! completeResult );
		if ( completeResult ) {
			setActiveStepNumber( nextStepNumber );
		}
		setFormReady();
	};
	const goToNextStep = async () => {
		const completeResult = isCompleteCallback();
		if ( completeResult.then ) {
			setFormValidating();
			const delayedCompleteResult = await completeResult;
			finishIsCompleteCallback( delayedCompleteResult );
			return;
		}
		finishIsCompleteCallback( completeResult );
	};

	const classNames = [
		'checkout-step',
		...( isStepActive ? [ 'checkout-step--is-active' ] : [] ),
		...( isStepComplete ? [ 'checkout-step--is-complete' ] : [] ),
		...( className ? [ className ] : [] ),
	];

	return (
		<CheckoutStepBody
			errorMessage={ localize( 'There was an error with this step.' ) }
			editButtonText={ editButtonText || localize( 'Edit' ) }
			editButtonAriaLabel={ editButtonAriaLabel || localize( 'Edit this step' ) }
			nextStepButtonText={ nextStepButtonText || localize( 'Continue' ) }
			nextStepButtonAriaLabel={ nextStepButtonAriaLabel || localize( 'Continue to the next step' ) }
			validatingButtonText={ validatingButtonText || localize( 'Please wait…' ) }
			validatingButtonAriaLabel={ validatingButtonAriaLabel || localize( 'Please wait…' ) }
			isStepActive={ isStepActive }
			isStepComplete={ isStepComplete }
			stepNumber={ stepNumber }
			totalSteps={ totalSteps }
			stepId={ stepId }
			titleContent={ titleContent }
			goToThisStep={ goToThisStep }
			goToNextStep={ goToNextStep }
			activeStepContent={ activeStepContent }
			nextStepNumber={ nextStepNumber }
			formStatus={ formStatus }
			completeStepContent={ completeStepContent }
			className={ joinClasses( classNames ) }
		/>
	);
}

export function CheckoutStepBody( {
	errorMessage,
	editButtonText,
	editButtonAriaLabel,
	nextStepButtonText,
	validatingButtonText,
	nextStepButtonAriaLabel,
	validatingButtonAriaLabel,
	isStepActive,
	isStepComplete,
	className,
	stepNumber,
	totalSteps,
	stepId,
	titleContent,
	goToThisStep,
	goToNextStep,
	activeStepContent,
	nextStepNumber,
	formStatus,
	completeStepContent,
} ) {
	return (
		<CheckoutErrorBoundary errorMessage={ errorMessage }>
			<StepWrapperUI
				isActive={ isStepActive }
				isComplete={ isStepComplete }
				className={ className }
				isFinalStep={ stepNumber === totalSteps }
			>
				<CheckoutStepHeader
					id={ stepId }
					stepNumber={ stepNumber }
					title={ titleContent }
					isActive={ isStepActive }
					isComplete={ isStepComplete }
					onEdit={
						formStatus === 'ready' && isStepComplete && goToThisStep && ! isStepActive
							? goToThisStep
							: null
					}
					editButtonText={ editButtonText || 'Edit' }
					editButtonAriaLabel={ editButtonAriaLabel || 'Edit this step' }
				/>
				<StepContentUI isVisible={ isStepActive } className="checkout-steps__step-content">
					{ activeStepContent }
					{ nextStepNumber > 0 && goToNextStep && isStepActive && (
						<CheckoutNextStepButton
							onClick={ goToNextStep }
							value={
								formStatus === 'validating'
									? validatingButtonText || 'Please wait…'
									: nextStepButtonText || 'Continue'
							}
							ariaLabel={
								formStatus === 'validating'
									? validatingButtonAriaLabel || 'Please wait…'
									: nextStepButtonAriaLabel || 'Continue to next step'
							}
							buttonState={ formStatus !== 'ready' ? 'disabled' : 'primary' }
							disabled={ formStatus !== 'ready' }
						/>
					) }
				</StepContentUI>
				{ isStepComplete && completeStepContent ? (
					<StepSummaryUI
						isVisible={ ! isStepActive }
						className="checkout-steps__step-complete-content"
					>
						{ completeStepContent }
					</StepSummaryUI>
				) : null }
			</StepWrapperUI>
		</CheckoutErrorBoundary>
	);
}

CheckoutStepBody.propTypes = {
	errorMessage: PropTypes.string,
	editButtonAriaLabel: PropTypes.string,
	nextStepButtonText: PropTypes.string,
	nextStepButtonAriaLabel: PropTypes.string,
	isStepActive: PropTypes.bool.isRequired,
	isStepComplete: PropTypes.bool.isRequired,
	className: PropTypes.string,
	stepNumber: PropTypes.number.isRequired,
	totalSteps: PropTypes.number.isRequired,
	stepId: PropTypes.string.isRequired,
	titleContent: PropTypes.node.isRequired,
	goToThisStep: PropTypes.func,
	goToNextStep: PropTypes.func,
	activeStepContent: PropTypes.node,
	nextStepNumber: PropTypes.number,
	formStatus: PropTypes.string,
	completeStepContent: PropTypes.node,
};

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

const SubmitButtonWrapperUI = styled.div`
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
	editButtonText,
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
					{ editButtonText || localize( 'Edit' ) }
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
	editButtonText: PropTypes.string,
	editButtonAriaLabel: PropTypes.string,
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
