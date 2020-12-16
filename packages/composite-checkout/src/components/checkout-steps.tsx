/**
 * External dependencies
 */
import React, {
	Dispatch,
	SetStateAction,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react';
import debugFactory from 'debug';
import PropTypes from 'prop-types';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
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
	getDefaultOrderSummary,
	getDefaultOrderSummaryStep,
	getDefaultPaymentMethodStep,
	useEvents,
	usePaymentMethod,
} from '../public-api';
import styled from '../lib/styled';
import { Theme } from '../lib/theme';
import { FormStatus } from '../types';

const debug = debugFactory( 'composite-checkout:checkout' );

interface StepCompleteStatus {
	[ key: string ]: boolean;
}

interface CheckoutStepDataContext {
	activeStepNumber: number;
	stepCompleteStatus: StepCompleteStatus;
	totalSteps: number;
	setActiveStepNumber: ( stepNumber: number ) => void;
	setStepCompleteStatus: Dispatch< SetStateAction< StepCompleteStatus > >;
	setTotalSteps: ( totalSteps: number ) => void;
}

interface CheckoutSingleStepDataContext {
	stepNumber: number;
	nextStepNumber: number | null;
	isStepActive: boolean;
	isStepComplete: boolean;
	areStepsActive: boolean;
}

const CheckoutStepDataContext = React.createContext< CheckoutStepDataContext >( {
	activeStepNumber: 0,
	stepCompleteStatus: {},
	totalSteps: 0,
	setActiveStepNumber: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
	setStepCompleteStatus: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
	setTotalSteps: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
} );

const CheckoutSingleStepDataContext = React.createContext< CheckoutSingleStepDataContext >( {
	stepNumber: 0,
	nextStepNumber: null,
	isStepActive: false,
	isStepComplete: false,
	areStepsActive: false,
} );

const CheckoutWrapper = styled.div`
	*:focus {
		outline: ${ ( props ) => props.theme.colors.outline } solid 2px;
	}
`;

export const MainContentWrapper = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;

	@media ( ${ ( props ) => props.theme.breakpoints.tabletUp } ) {
		margin: 0 auto 32px;
	}

	@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
		align-items: flex-start;
		flex-direction: row;
		justify-content: center;
		max-width: none;
	}
`;

const CheckoutSummary = styled.div`
	box-sizing: border-box;
	margin: 0 auto;
	width: 100%;

	@media ( ${ ( props ) => props.theme.breakpoints.tabletUp } ) {
		max-width: 556px;
	}

	@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
		margin-right: 0;
		margin-left: 24px;
		order: 2;
		width: 328px;

		.rtl & {
			margin-right: 24px;
			margin-left: 0;
		}
	}
`;

export const CheckoutSummaryArea = ( {
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
} ): JSX.Element => {
	return (
		<CheckoutSummary className={ joinClasses( [ className, 'checkout__summary-area' ] ) }>
			{ children }
		</CheckoutSummary>
	);
};

export const CheckoutSummaryCard = styled.div`
	background: ${ ( props ) => props.theme.colors.surface };
	border-bottom: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };

	@media ( ${ ( props ) => props.theme.breakpoints.smallPhoneUp } ) {
		border: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
		border-bottom: none 0;
	}

	@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
		border: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
	}
`;

export const CheckoutSteps = ( {
	children,
	areStepsActive = true,
}: CheckoutStepsProps ): JSX.Element => {
	let stepNumber = 0;
	let nextStepNumber: number | null = 1;

	const steps = React.Children.toArray( children ).filter( ( child ) => child );
	const totalSteps = steps.length;
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

	return (
		<>
			{ steps.map( ( child ) => {
				stepNumber = nextStepNumber || 0;
				nextStepNumber = stepNumber === totalSteps ? null : stepNumber + 1;
				const isStepActive = areStepsActive && activeStepNumber === stepNumber;
				const isStepComplete = !! stepCompleteStatus[ stepNumber ];
				return (
					<CheckoutSingleStepDataContext.Provider
						key={ 'checkout-step-' + stepNumber }
						value={ {
							stepNumber,
							nextStepNumber,
							isStepActive,
							isStepComplete,
							areStepsActive,
						} }
					>
						{ child }
					</CheckoutSingleStepDataContext.Provider>
				);
			} ) }
		</>
	);
};

interface CheckoutStepsProps {
	children?: React.ReactNode;
	areStepsActive?: boolean;
}

export function Checkout( {
	children,
	className,
}: {
	children: React.ReactChildren;
	className?: string;
} ): JSX.Element {
	const { isRTL } = useI18n();
	const { formStatus } = useFormStatus();
	const [ activeStepNumber, setActiveStepNumber ] = useState< number >( 1 );
	const [ stepCompleteStatus, setStepCompleteStatus ] = useState< StepCompleteStatus >( {} );
	const [ totalSteps, setTotalSteps ] = useState( 0 );
	const actualActiveStepNumber =
		activeStepNumber > totalSteps && totalSteps > 0 ? totalSteps : activeStepNumber;

	// Change the step if the url changes
	useChangeStepNumberForUrl( setActiveStepNumber );

	const getDefaultCheckoutSteps = () => <DefaultCheckoutSteps />;

	const classNames = joinClasses( [
		'composite-checkout',
		...( className ? [ className ] : [] ),
		...( isRTL() ? [ 'rtl' ] : [] ),
	] );

	if ( formStatus === FormStatus.LOADING ) {
		return (
			<CheckoutWrapper className={ classNames }>
				<MainContentWrapper className={ joinClasses( [ className, 'checkout__content' ] ) }>
					<LoadingContent />
				</MainContentWrapper>
			</CheckoutWrapper>
		);
	}

	return (
		<CheckoutWrapper className={ classNames }>
			<MainContentWrapper className={ joinClasses( [ className, 'checkout__content' ] ) }>
				<CheckoutStepDataContext.Provider
					value={ {
						activeStepNumber: actualActiveStepNumber,
						stepCompleteStatus,
						totalSteps,
						setActiveStepNumber,
						setStepCompleteStatus,
						setTotalSteps,
					} }
				>
					{ children || getDefaultCheckoutSteps() }
				</CheckoutStepDataContext.Provider>
			</MainContentWrapper>
		</CheckoutWrapper>
	);
}

export const CheckoutStep = ( {
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
}: {
	stepId: string;
	titleContent: React.ReactNode;
	isCompleteCallback: () => boolean | Promise< boolean >;
	activeStepContent?: React.ReactNode;
	completeStepContent?: React.ReactNode;
	className?: string;
	editButtonText?: string;
	editButtonAriaLabel?: string;
	nextStepButtonText?: string;
	nextStepButtonAriaLabel?: string;
	validatingButtonText?: string;
	validatingButtonAriaLabel?: string;
} ): JSX.Element => {
	const { __ } = useI18n();
	const { setActiveStepNumber, setStepCompleteStatus, stepCompleteStatus } = useContext(
		CheckoutStepDataContext
	);
	const { stepNumber, nextStepNumber, isStepActive, isStepComplete, areStepsActive } = useContext(
		CheckoutSingleStepDataContext
	);
	const { formStatus, setFormValidating, setFormReady } = useFormStatus();
	const setThisStepCompleteStatus = ( newStatus: boolean ) =>
		setStepCompleteStatus( { ...stepCompleteStatus, [ stepNumber ]: newStatus } );
	const goToThisStep = () => setActiveStepNumber( stepNumber );
	const onEvent = useEvents();
	const activePaymentMethod = usePaymentMethod();
	const finishIsCompleteCallback = ( completeResult: boolean ) => {
		setThisStepCompleteStatus( !! completeResult );
		if ( completeResult ) {
			onEvent( {
				type: 'STEP_NUMBER_CHANGED',
				payload: {
					stepNumber: nextStepNumber,
					previousStepNumber: stepNumber,
					paymentMethodId: activePaymentMethod?.id ?? '',
				},
			} );
			if ( nextStepNumber ) {
				saveStepNumberToUrl( nextStepNumber );
				setActiveStepNumber( nextStepNumber );
			}
		}
		setFormReady();
	};
	const goToNextStep = async () => {
		// Wrapping this in Promise.resolve allows it to be a Promise or boolean
		const completeResult = Promise.resolve( isCompleteCallback() );
		setFormValidating();
		const delayedCompleteResult = await completeResult;
		finishIsCompleteCallback( delayedCompleteResult );
	};

	const classNames = [
		'checkout-step',
		...( isStepActive ? [ 'is-active' ] : [] ),
		...( isStepComplete ? [ 'is-complete' ] : [] ),
		...( className ? [ className ] : [] ),
	];

	const onError = useCallback(
		( error ) =>
			onEvent( {
				type: 'STEP_LOAD_ERROR',
				payload: {
					message: error,
					stepId,
				},
			} ),
		[ onEvent, stepId ]
	);

	return (
		<CheckoutStepBody
			onError={ onError }
			editButtonText={ editButtonText || __( 'Edit' ) }
			editButtonAriaLabel={ editButtonAriaLabel || __( 'Edit this step' ) }
			nextStepButtonText={ nextStepButtonText || __( 'Continue' ) }
			nextStepButtonAriaLabel={ nextStepButtonAriaLabel || __( 'Continue to the next step' ) }
			validatingButtonText={ validatingButtonText || __( 'Please wait…' ) }
			validatingButtonAriaLabel={ validatingButtonAriaLabel || __( 'Please wait…' ) }
			isStepActive={ isStepActive }
			isStepComplete={ isStepComplete }
			stepNumber={ stepNumber }
			stepId={ stepId }
			titleContent={ titleContent }
			goToThisStep={ areStepsActive ? goToThisStep : undefined }
			goToNextStep={ nextStepNumber && nextStepNumber > 0 ? goToNextStep : undefined }
			activeStepContent={ activeStepContent }
			formStatus={ formStatus }
			completeStepContent={ completeStepContent }
			className={ joinClasses( classNames ) }
		/>
	);
};

function DefaultCheckoutSteps() {
	const orderSummary = getDefaultOrderSummary();
	const orderSummaryStep = getDefaultOrderSummaryStep();
	const paymentMethodStep = getDefaultPaymentMethodStep();
	const reviewOrderStep = getDefaultOrderReviewStep();
	return (
		<React.Fragment>
			<CheckoutSummaryArea className={ orderSummary.className }>
				<CheckoutSummaryCard>{ orderSummary.summaryContent }</CheckoutSummaryCard>
			</CheckoutSummaryArea>
			<CheckoutStepArea>
				<CheckoutStepBody
					activeStepContent={ orderSummaryStep.activeStepContent }
					completeStepContent={ orderSummaryStep.completeStepContent }
					titleContent={ orderSummaryStep.titleContent }
					isStepActive={ false }
					isStepComplete={ true }
					stepNumber={ 1 }
					stepId={ 'order-summary-step' }
					className={ orderSummaryStep.className }
				/>
				<CheckoutSteps>
					<CheckoutStep
						stepId="review-order-step"
						isCompleteCallback={ () => true }
						activeStepContent={ reviewOrderStep.activeStepContent }
						completeStepContent={ reviewOrderStep.completeStepContent }
						titleContent={ reviewOrderStep.titleContent }
						className={ reviewOrderStep.className }
					/>
					<CheckoutStep
						stepId="payment-method-step"
						isCompleteCallback={ () => true }
						activeStepContent={ paymentMethodStep.activeStepContent }
						completeStepContent={ paymentMethodStep.completeStepContent }
						titleContent={ paymentMethodStep.titleContent }
						className={ paymentMethodStep.className }
					/>
				</CheckoutSteps>
			</CheckoutStepArea>
		</React.Fragment>
	);
}

export const CheckoutStepAreaWrapper = styled.div`
	background: ${ ( props ) => props.theme.colors.surface };
	box-sizing: border-box;
	margin: 0 auto;
	width: 100%;

	&.checkout__step-wrapper--last-step {
		margin-bottom: 100px;
	}

	@media ( ${ ( props ) => props.theme.breakpoints.smallPhoneUp } ) {
		border: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
	}

	@media ( ${ ( props ) => props.theme.breakpoints.tabletUp } ) {
		max-width: 556px;
	}

	@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
		margin: 0;
		order: 1;
		width: 556px;
	}
`;

export const SubmitButtonWrapper = styled.div`
	background: ${ ( props ) => props.theme.colors.background };
	padding: 24px;
	bottom: 0;
	left: 0;
	box-sizing: border-box;
	width: 100%;
	z-index: 10;
	border-top-width: 0;
	border-top-style: solid;
	border-top-color: ${ ( props ) => props.theme.colors.borderColorLight };

	.checkout__step-wrapper--last-step & {
		border-top-width: 1px;
		position: fixed;
	}

	.rtl & {
		right: 0;
		left: auto;
	}

	.checkout-button {
		width: calc( 100% - 60px );
	}

	@media ( ${ ( props ) => props.theme.breakpoints.tabletUp } ) {
		.checkout-button {
			width: 100%;
		}

		.checkout__step-wrapper--last-step & {
			position: relative;
			border: 0;
		}
	}
`;

export function CheckoutStepArea( {
	children,
	className,
	submitButtonHeader,
	disableSubmitButton,
}: {
	children: React.ReactNode;
	className?: string;
	submitButtonHeader?: React.ReactNode;
	disableSubmitButton?: boolean;
} ): JSX.Element {
	const { __ } = useI18n();
	const onEvent = useEvents();
	const { formStatus } = useFormStatus();

	const { activeStepNumber, totalSteps } = useContext( CheckoutStepDataContext );
	const actualActiveStepNumber =
		activeStepNumber > totalSteps && totalSteps > 0 ? totalSteps : activeStepNumber;
	const isThereAnotherNumberedStep = actualActiveStepNumber < totalSteps;
	const onSubmitButtonLoadError = useCallback(
		( error ) => onEvent( { type: 'SUBMIT_BUTTON_LOAD_ERROR', payload: error } ),
		[ onEvent ]
	);

	const classNames = joinClasses( [
		'checkout__step-wrapper',
		...( className ? [ className ] : [] ),
		...( ! isThereAnotherNumberedStep ? [ 'checkout__step-wrapper--last-step' ] : [] ),
	] );

	return (
		<CheckoutStepAreaWrapper className={ classNames }>
			{ children }

			<SubmitButtonWrapper className="checkout-steps__submit-button-wrapper">
				{ submitButtonHeader ? submitButtonHeader : null }
				<CheckoutErrorBoundary
					errorMessage={ __( 'There was a problem with the submit button.' ) }
					onError={ onSubmitButtonLoadError }
				>
					<CheckoutSubmitButton
						disabled={
							isThereAnotherNumberedStep || formStatus !== FormStatus.READY || disableSubmitButton
						}
					/>
				</CheckoutErrorBoundary>
			</SubmitButtonWrapper>
		</CheckoutStepAreaWrapper>
	);
}

const StepWrapper = styled.div< React.HTMLAttributes< HTMLDivElement > >`
	position: relative;
	border-bottom: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
	padding: 16px;

	&.checkout-step {
		background: ${ ( props ) => props.theme.colors.background };
	}

	&.checkout-step.is-active,
	&.checkout-step.is-complete {
		background: ${ ( props ) => props.theme.colors.surface };
	}

	@media ( ${ ( props ) => props.theme.breakpoints.tabletUp } ) {
		padding: 24px;
	}
`;

const StepContentWrapper = styled.div<
	StepContentWrapperProps & React.HTMLAttributes< HTMLDivElement >
>`
	color: ${ ( props ) => props.theme.colors.textColor };
	display: ${ ( props ) => ( props.isVisible ? 'block' : 'none' ) };
	padding-left: 35px;

	.rtl & {
		padding-right: 35px;
		padding-left: 0;
	}
`;

interface StepContentWrapperProps {
	isVisible?: boolean;
}

const StepSummaryWrapper = styled.div<
	StepContentWrapperProps & React.HTMLAttributes< HTMLDivElement >
>`
	color: ${ ( props ) => props.theme.colors.textColorLight };
	font-size: 14px;
	display: ${ ( props ) => ( props.isVisible ? 'block' : 'none' ) };
	padding-left: 35px;

	.rtl & {
		padding-right: 35px;
		padding-left: 0;
	}
`;

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
	stepId,
	titleContent,
	goToThisStep,
	goToNextStep,
	activeStepContent,
	formStatus,
	completeStepContent,
	onError,
}: CheckoutStepBodyProps ): JSX.Element {
	const { __ } = useI18n();
	return (
		<CheckoutErrorBoundary
			errorMessage={ errorMessage || __( 'There was an error with this step.' ) }
			onError={ onError }
		>
			<StepWrapper className={ className }>
				<CheckoutStepHeader
					id={ stepId }
					stepNumber={ stepNumber }
					title={ titleContent }
					isActive={ isStepActive }
					isComplete={ isStepComplete }
					onEdit={
						formStatus === FormStatus.READY && isStepComplete && goToThisStep && ! isStepActive
							? goToThisStep
							: undefined
					}
					editButtonText={ editButtonText || __( 'Edit' ) }
					editButtonAriaLabel={ editButtonAriaLabel || __( 'Edit this step' ) }
				/>
				<StepContentWrapper isVisible={ isStepActive } className="checkout-steps__step-content">
					{ activeStepContent }
					{ goToNextStep && isStepActive && (
						<CheckoutNextStepButton
							onClick={ goToNextStep }
							value={
								formStatus === FormStatus.VALIDATING
									? validatingButtonText || __( 'Please wait…' )
									: nextStepButtonText || __( 'Continue' )
							}
							ariaLabel={
								formStatus === FormStatus.VALIDATING
									? validatingButtonAriaLabel || __( 'Please wait…' )
									: nextStepButtonAriaLabel || __( 'Continue to next step' )
							}
							buttonType="primary"
							disabled={ formStatus !== FormStatus.READY }
							isBusy={ formStatus === FormStatus.VALIDATING }
						/>
					) }
				</StepContentWrapper>
				{ isStepComplete && completeStepContent ? (
					<StepSummaryWrapper
						isVisible={ ! isStepActive }
						className="checkout-steps__step-complete-content"
					>
						{ completeStepContent }
					</StepSummaryWrapper>
				) : null }
			</StepWrapper>
		</CheckoutErrorBoundary>
	);
}

interface CheckoutStepBodyProps {
	errorMessage?: string;
	onError?: ( message: string ) => void;
	editButtonAriaLabel?: string;
	editButtonText?: string;
	nextStepButtonText?: string;
	nextStepButtonAriaLabel?: string;
	isStepActive: boolean;
	isStepComplete: boolean;
	className?: string;
	stepNumber?: number;
	stepId: string;
	titleContent: React.ReactNode;
	goToThisStep?: () => void;
	goToNextStep?: () => void;
	activeStepContent?: React.ReactNode;
	formStatus?: FormStatus;
	completeStepContent?: React.ReactNode;
	validatingButtonText?: string;
	validatingButtonAriaLabel?: string;
}

CheckoutStepBody.propTypes = {
	errorMessage: PropTypes.string,
	onError: PropTypes.func,
	editButtonAriaLabel: PropTypes.string,
	editButtonText: PropTypes.string,
	nextStepButtonText: PropTypes.string,
	nextStepButtonAriaLabel: PropTypes.string,
	isStepActive: PropTypes.bool.isRequired,
	isStepComplete: PropTypes.bool.isRequired,
	className: PropTypes.string,
	stepNumber: PropTypes.number,
	stepId: PropTypes.string.isRequired,
	titleContent: PropTypes.node.isRequired,
	goToThisStep: PropTypes.func,
	goToNextStep: PropTypes.func,
	activeStepContent: PropTypes.node,
	formStatus: PropTypes.string,
	completeStepContent: PropTypes.node,
	validatingButtonText: PropTypes.string,
	validatingButtonAriaLabel: PropTypes.string,
};

export function useIsStepActive(): boolean {
	const { activeStepNumber } = useContext( CheckoutStepDataContext );
	const { stepNumber } = useContext( CheckoutSingleStepDataContext );
	return activeStepNumber === stepNumber;
}

export function useIsStepComplete(): boolean {
	const { stepCompleteStatus } = useContext( CheckoutStepDataContext );
	const { stepNumber } = useContext( CheckoutSingleStepDataContext );
	return !! stepCompleteStatus[ stepNumber ];
}

export function useSetStepComplete(): ( stepNumber: number, newStatus: boolean ) => void {
	const { setStepCompleteStatus } = useContext( CheckoutStepDataContext );
	const setTargetStepCompleteStatus = useCallback(
		( stepNumber: number, newStatus: boolean ) =>
			setStepCompleteStatus(
				( stepCompleteStatus: StepCompleteStatus ): StepCompleteStatus => ( {
					...stepCompleteStatus,
					[ stepNumber ]: newStatus,
				} )
			),
		[ setStepCompleteStatus ]
	);
	return setTargetStepCompleteStatus;
}

const StepTitle = styled.span< StepTitleProps & React.HTMLAttributes< HTMLSpanElement > >`
	color: ${ ( props ) =>
		props.isActive ? props.theme.colors.textColorDark : props.theme.colors.textColor };
	font-weight: ${ ( props ) =>
		props.isActive ? props.theme.weights.bold : props.theme.weights.normal };
	margin-right: ${ ( props ) => ( props.fullWidth ? '0' : '8px' ) };
	flex: 1;

	.rtl & {
		margin-right: 0;
		margin-left: ${ ( props ) => ( props.fullWidth ? '0' : '8px' ) };
	}
`;

interface StepTitleProps {
	isActive?: boolean;
	fullWidth?: boolean;
}

const StepHeader = styled.h2< StepHeaderProps & React.HTMLAttributes< HTMLHeadingElement > >`
	font-size: 16px;
	display: flex;
	width: 100%;
	align-items: center;
	margin: 0 0 ${ ( props ) => ( props.isComplete || props.isActive ? '8px' : '0' ) };
`;

interface StepHeaderProps {
	isComplete?: boolean;
	isActive?: boolean;
}

const HeaderEditButton = styled( Button )`
	font-size: 14px;
	padding-top: 1px;
`;

/* eslint-disable wpcalypso/jsx-classname-namespace */
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
}: {
	id: string;
	className?: string;
	stepNumber?: number;
	title: React.ReactNode;
	isActive?: boolean;
	isComplete?: boolean;
	onEdit?: () => void;
	editButtonText?: string;
	editButtonAriaLabel?: string;
} ) {
	const { __ } = useI18n();
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
				<HeaderEditButton
					className="checkout-step__edit-button"
					buttonType="text-button"
					onClick={ onEdit }
					aria-label={ editButtonAriaLabel || __( 'Edit this step' ) }
				>
					{ editButtonText || __( 'Edit' ) }
				</HeaderEditButton>
			) }
		</StepHeader>
	);
}

const StepNumberOuterWrapper = styled.div`
	position: relative;
	width: 27px;
	height: 27px;
	margin-right: 8px;

	.rtl & {
		margin-right: 0;
		margin-left: 8px;
	}
`;

const StepNumberInnerWrapper = styled.div<
	StepNumberInnerWrapperProps & React.HTMLAttributes< HTMLDivElement >
>`
	position: relative;
	transform-origin: center center;
	transition: transform 0.3s 0.1s ease-out;
	transform-style: preserve-3d;
	transform: ${ ( props ) => ( props.isComplete ? 'rotateY(180deg)' : 'rotateY(0)' ) };
`;

interface StepNumberInnerWrapperProps {
	isComplete?: boolean;
}

const StepNumber = styled.div< StepNumberProps & React.HTMLAttributes< HTMLDivElement > >`
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

	.rtl & {
		right: 0;
		left: auto;
	}

	// Reason: The IE media query needs to not have spaces within brackets otherwise ie11 doesn't read them
	// prettier-ignore
	@media all and (-ms-high-contrast:none), (-ms-high-contrast:active) {
		z-index: ${ ( props ) => ( props.isComplete ? '0' : '1' ) };
	}
`;

interface StepNumberProps {
	isComplete?: boolean;
	isActive?: boolean;
}

const StepNumberCompleted = styled( StepNumber )`
	background: ${ ( props ) => props.theme.colors.success };
	transform: rotateY( 180deg );
	// Reason: media query needs to not have spaces within brackets otherwise ie11 doesn't read them
	// prettier-ignore
	@media all and (-ms-high-contrast:none), (-ms-high-contrast:active) {
		backface-visibility: visible;
		z-index: ${ ( props ) => ( props.isComplete ? '1' : '0' ) };
	}

	svg {
		margin-top: 4px;
	}
`;

CheckoutStepHeader.propTypes = {
	id: PropTypes.string,
	className: PropTypes.string,
	stepNumber: PropTypes.number,
	title: PropTypes.node.isRequired,
	isActive: PropTypes.bool,
	isComplete: PropTypes.bool,
	editButtonText: PropTypes.string,
	editButtonAriaLabel: PropTypes.string,
	onEdit: PropTypes.func,
};

function Stepper( {
	isComplete,
	isActive,
	className,
	children,
	id,
}: {
	id: string;
	className?: string;
	isComplete?: boolean;
	isActive?: boolean;
	children?: React.ReactNode;
} ) {
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

function getStepNumberBackgroundColor( {
	isComplete,
	isActive,
	theme,
}: {
	isComplete?: boolean;
	isActive?: boolean;
	theme: Theme;
} ) {
	if ( isActive ) {
		return theme.colors.highlight;
	}
	if ( isComplete ) {
		return theme.colors.success;
	}
	return theme.colors.upcomingStepBackground;
}

function getStepNumberForegroundColor( {
	isComplete,
	isActive,
	theme,
}: {
	isComplete?: boolean;
	isActive?: boolean;
	theme: Theme;
} ) {
	if ( isComplete || isActive ) {
		return theme.colors.surface;
	}
	return theme.colors.textColor;
}

function saveStepNumberToUrl( stepNumber: number ) {
	if ( ! window.history?.pushState ) {
		return;
	}
	const newHash = stepNumber > 1 ? `#step${ stepNumber }` : '';
	if ( window.location.hash === newHash ) {
		return;
	}
	const newUrl = window.location.hash
		? window.location.href.replace( window.location.hash, newHash )
		: window.location.href + newHash;
	debug( 'updating url to', newUrl );
	window.history.pushState( null, '', newUrl );
}

function getStepNumberFromUrl() {
	const hashValue = window.location?.hash;
	if ( hashValue?.startsWith?.( '#step' ) ) {
		const parts = hashValue.split( '#step' );
		const stepNumber = parts.length > 1 ? parts[ 1 ] : '1';
		return parseInt( stepNumber, 10 );
	}
	return 1;
}

function useChangeStepNumberForUrl( setActiveStepNumber: ( stepNumber: number ) => void ) {
	// If there is a step number on page load, remove it
	useEffect( () => {
		const newStepNumber = getStepNumberFromUrl();
		if ( newStepNumber ) {
			saveStepNumberToUrl( 1 );
		}
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect( () => {
		let isSubscribed = true;
		window.addEventListener?.( 'hashchange', () => {
			const newStepNumber = getStepNumberFromUrl();
			debug( 'step number in url changed to', newStepNumber );
			isSubscribed && setActiveStepNumber( newStepNumber );
		} );
		return () => {
			isSubscribed = false;
		};
	}, [ setActiveStepNumber ] );
}
