import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import debugFactory from 'debug';
import PropTypes from 'prop-types';
import {
	cloneElement,
	Children,
	useCallback,
	useContext,
	useEffect,
	useState,
	createContext,
	useRef,
	useMemo,
} from 'react';
import { getDefaultPaymentMethodStep } from '../components/default-steps';
import CheckoutContext from '../lib/checkout-context';
import { useFormStatus } from '../lib/form-status';
import joinClasses from '../lib/join-classes';
import { usePaymentMethod } from '../lib/payment-methods';
import { SubscriptionManager } from '../lib/subscription-manager';
import { CheckoutStepGroupActions, FormStatus } from '../types';
import Button from './button';
import CheckoutErrorBoundary from './checkout-error-boundary';
import CheckoutNextStepButton from './checkout-next-step-button';
import CheckoutSubmitButton from './checkout-submit-button';
import LoadingContent from './loading-content';
import { CheckIcon } from './shared-icons';
import { useCustomPropertyForHeight } from './use-custom-property-for-height';
import type {
	CheckoutStepProps,
	StepCompleteCallback,
	SetStepComplete,
	CheckoutStepGroupState,
	CheckoutStepCompleteStatus,
	CheckoutStepGroupStore,
	StepChangedCallback,
	MakeStepActive,
} from '../types';
import type { ReactNode, HTMLAttributes, PropsWithChildren, ReactElement } from 'react';

const debug = debugFactory( 'composite-checkout:checkout-steps' );

const customPropertyForSubmitButtonHeight = '--submit-button-height';

interface CheckoutSingleStepDataContext {
	stepNumber: number;
	nextStepNumber: number | null;
	isStepActive: boolean;
	isStepComplete: boolean;
	areStepsActive: boolean;
}

const noop = () => {
	throw new Error( 'Cannot use CheckoutStepGroupContext without a provider.' );
};
const noopPromise = () => () =>
	Promise.reject( 'Cannot use CheckoutStepGroupContext without a provider.' );
const emptyStepCompleteStatus = {};
const CheckoutStepGroupContext = createContext< CheckoutStepGroupStore >( {
	state: {
		activeStepNumber: 0,
		stepCompleteStatus: emptyStepCompleteStatus,
		totalSteps: 0,
		stepIdMap: {},
		stepCompleteCallbackMap: {},
	},
	actions: {
		makeStepActive: noop,
		setStepComplete: noop,
		setActiveStepNumber: noop,
		setStepCompleteStatus: noop,
		setStepCompleteCallback: noop,
		getStepCompleteCallback: noopPromise,
		getStepNumberFromId: noop,
		setTotalSteps: noop,
	},
	subscription: new SubscriptionManager(),
} );

export function createCheckoutStepGroupStore(): CheckoutStepGroupStore {
	const state = createCheckoutStepGroupState();
	const subscription = new SubscriptionManager();
	const actions = createCheckoutStepGroupActions( state, subscription.notifySubscribers );
	return {
		state,
		actions,
		subscription,
	};
}

function createCheckoutStepGroupState(): CheckoutStepGroupState {
	return {
		activeStepNumber: 1,
		totalSteps: 0,
		stepCompleteStatus: {},
		stepIdMap: {},
		stepCompleteCallbackMap: {},
	};
}

function createCheckoutStepGroupActions(
	state: CheckoutStepGroupState,
	onStateChange: () => void
): CheckoutStepGroupActions {
	const setActiveStepNumber = ( stepNumber: number ) => {
		debug( `setting active step number to ${ stepNumber }` );
		if ( stepNumber > state.totalSteps && state.totalSteps === 0 ) {
			throw new Error(
				`Cannot set step number to '${ stepNumber }' because the total number of steps is 0`
			);
		}
		if ( stepNumber > state.totalSteps ) {
			debug( `setting active step number to ${ stepNumber }; using highest step instead` );
			stepNumber = state.totalSteps;
		}
		if ( stepNumber === state.activeStepNumber ) {
			debug( `setting active step number to ${ stepNumber }; step already active` );
			return;
		}
		state.activeStepNumber = stepNumber;
		onStateChange();
	};

	const validateActiveStepNumber = () => {
		if ( state.activeStepNumber > state.totalSteps ) {
			state.activeStepNumber = state.totalSteps;
		}
	};

	const setTotalSteps = ( stepCount: number ) => {
		if ( stepCount < 0 ) {
			throw new Error( `Cannot set total steps to '${ stepCount }' because it is too low` );
		}
		if ( stepCount === state.totalSteps ) {
			return;
		}
		state.totalSteps = stepCount;
		validateActiveStepNumber();
		onStateChange();
	};

	/**
	 * Update the current status of which steps are complete and which are
	 * incomplete.
	 *
	 * Remember that a complete step can be active and an incomplete step can be
	 * inactive. They are not connected.
	 *
	 * This merges the new status with the current status, so it's important to
	 * explicitly disable any step that you want to be incomplete.
	 */
	const setStepCompleteStatus = ( newStatus: CheckoutStepCompleteStatus ) => {
		const mergedStatus = { ...state.stepCompleteStatus, ...newStatus };
		debug( `setting step complete status to '${ JSON.stringify( mergedStatus ) }'` );
		state.stepCompleteStatus = mergedStatus;
		onStateChange();
	};

	const getStepNumberFromId = ( id: string ) => state.stepIdMap[ id ];

	const setStepCompleteCallback = (
		stepNumber: number,
		stepId: string,
		callback: StepCompleteCallback
	) => {
		state.stepIdMap[ stepId ] = stepNumber;
		state.stepCompleteCallbackMap[ stepNumber ] = callback;
	};

	const getStepCompleteCallback = ( stepNumber: number ) => {
		return (
			state.stepCompleteCallbackMap[ stepNumber ] ??
			( () => {
				throw new Error( `No isCompleteCallback found for step '${ stepNumber }'` );
			} )
		);
	};

	// A programmatic way to press the "Edit" button on a step.
	const makeStepActive = async ( stepId: string ) => {
		debug( `attempting to set step active: '${ stepId }'` );
		const stepNumber = getStepNumberFromId( stepId );
		if ( ! stepNumber ) {
			throw new Error( `Cannot find step with id '${ stepId }' when trying to set step active.` );
		}

		// If we are going backwards in steps, just do it. The user will end up on
		// this step again later anyway.
		if ( stepNumber < state.activeStepNumber ) {
			setActiveStepNumber( stepNumber );
			return true;
		}

		// If we are going forward in steps, we must try to complete each step
		// starting at the active one and ending before the new one, stopping at
		// any step that is not complete.
		const activeStep = state.activeStepNumber > 0 ? state.activeStepNumber : 1;
		for ( let step = activeStep; step < stepNumber; step++ ) {
			const didStepComplete = await getStepCompleteCallback( step )();
			debug(
				`attempting to set step complete: '${ stepId }'; step ${ step } result was ${ didStepComplete }`
			);
			if ( ! didStepComplete ) {
				return false;
			}
		}
		setActiveStepNumber( stepNumber );
		return true;
	};

	// A programmatic way to press the "Continue to next step" button on a step.
	const setStepComplete = async ( stepId: string ) => {
		debug( `attempting to set step complete: '${ stepId }'` );
		const stepNumber = getStepNumberFromId( stepId );
		if ( ! stepNumber ) {
			throw new Error( `Cannot find step with id '${ stepId }' when trying to set step complete.` );
		}
		// To try to complete a step, we must try to complete all previous steps
		// first, ignoring steps that are already complete.
		for ( let step = 1; step <= stepNumber; step++ ) {
			if ( ! state.stepCompleteStatus[ step ] ) {
				const didStepComplete = await getStepCompleteCallback( step )();
				debug(
					`attempting to set step complete: '${ stepId }'; step ${ step } result was ${ didStepComplete }`
				);
				if ( ! didStepComplete ) {
					return false;
				}
			}
		}
		return true;
	};

	return {
		setActiveStepNumber,
		setStepCompleteStatus,
		getStepNumberFromId,
		setStepCompleteCallback,
		getStepCompleteCallback,
		setTotalSteps,
		setStepComplete,
		makeStepActive,
	};
}

const CheckoutSingleStepDataContext = createContext< CheckoutSingleStepDataContext >( {
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
	width: 100%;

	@media ( ${ ( props ) => props.theme.breakpoints.tabletUp } ) {
		margin: 0 auto;
	}

	@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
		flex-direction: row;
		justify-content: center;
		max-width: none;
	}
`;

const CheckoutSummary = styled.div`
	box-sizing: border-box;
	margin: 0 auto;
	width: 100%;
	display: flex;
	flex-direction: column;

	@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
		padding-left: 24px;
		padding-right: 24px;
	}
`;

export const CheckoutSummaryArea = ( {
	children,
	className,
}: PropsWithChildren< {
	className?: string;
} > ) => {
	return (
		<CheckoutSummary className={ joinClasses( [ className, 'checkout__summary-area' ] ) }>
			{ children }
		</CheckoutSummary>
	);
};

function isElementAStep( el: ReactNode ): boolean {
	const childStep = el as { type?: { isCheckoutStep?: boolean } };
	return !! childStep?.type?.isCheckoutStep;
}

function isNodeAComponent( el: ReactNode ): el is ReactElement {
	const childStep = el as ReactElement;
	return childStep?.props !== undefined;
}

export const CheckoutStepGroupInner = ( {
	children,
	areStepsActive = true,
}: PropsWithChildren< CheckoutStepsProps > ) => {
	let stepNumber = 0;
	let nextStepNumber: number | null = 1;

	const childrenArray = Children.toArray( children );
	const steps = childrenArray.filter( isElementAStep );
	const totalSteps = steps.length;
	const { state, actions } = useContext( CheckoutStepGroupContext );
	const { activeStepNumber, stepCompleteStatus } = state;
	const { setTotalSteps } = actions;

	setTotalSteps( totalSteps );

	debug(
		'active step',
		activeStepNumber,
		'step complete status',
		JSON.stringify( stepCompleteStatus ),
		'total steps',
		totalSteps
	);

	return (
		<>
			{ childrenArray.map( ( child, childNumber ) => {
				if ( ! isNodeAComponent( child ) ) {
					return child;
				}
				if ( isElementAStep( child ) ) {
					stepNumber = nextStepNumber || 0;
					nextStepNumber = stepNumber === totalSteps ? 0 : stepNumber + 1;
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
				}
				// Provide a `key` prop
				return cloneElement( child, { key: 'checkout-non-step-' + childNumber } );
			} ) }
		</>
	);
};

interface CheckoutStepsProps {
	areStepsActive?: boolean;
}

function CheckoutStepGroupWrapper( {
	children,
	className,
	loadingContent,
	loadingHeader,
	onStepChanged,
	store,
}: PropsWithChildren< {
	className?: string;
	loadingContent?: ReactNode;
	loadingHeader?: ReactNode;
	onStepChanged?: StepChangedCallback;
	store: CheckoutStepGroupStore;
} > ) {
	const { isRTL } = useI18n();
	const { formStatus } = useFormStatus();

	const isMounted = useRef( true );
	useEffect( () => {
		isMounted.current = true;
		return () => {
			isMounted.current = false;
		};
	}, [] );
	const [ contextValue, setContextValue ] = useState( store );
	useEffect( () => {
		return store.subscription.subscribe( () => {
			// Force a re-render when the state changes by using setState and passing
			// a duplicate of the store object to the React context. This way all
			// context consumers get the modified store because its identity has
			// changed.
			setTimeout( () => {
				isMounted.current && setContextValue( { ...store } );
			}, 0 );
		} );
	}, [ store ] );

	const previousStepNumber = useRef( store.state.activeStepNumber );
	const activePaymentMethod = usePaymentMethod();
	// Call the `onStepChanged` callback when a step changes.
	useEffect( () => {
		if ( store.state.activeStepNumber !== previousStepNumber.current ) {
			onStepChanged?.( {
				stepNumber: store.state.activeStepNumber,
				previousStepNumber: previousStepNumber.current,
				paymentMethodId: activePaymentMethod?.id ?? '',
			} );
			previousStepNumber.current = store.state.activeStepNumber;
		}
		// We only want to run this when the step changes.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ store.state.activeStepNumber ] );

	// WordPress.com checkout session activity.
	const classNames = joinClasses( [
		'composite-checkout',
		...( className ? [ className ] : [] ),
		...( isRTL() ? [ 'rtl' ] : [] ),
	] );

	if ( formStatus === FormStatus.LOADING ) {
		return (
			<CheckoutWrapper className={ classNames }>
				<MainContentWrapper className={ joinClasses( [ className, 'checkout__content' ] ) }>
					{ loadingHeader }
					{ loadingContent ? loadingContent : <LoadingContent /> }
				</MainContentWrapper>
			</CheckoutWrapper>
		);
	}

	return (
		<CheckoutWrapper className={ classNames }>
			<MainContentWrapper className={ joinClasses( [ className, 'checkout__content' ] ) }>
				<CheckoutStepGroupContext.Provider value={ contextValue }>
					{ children }
				</CheckoutStepGroupContext.Provider>
			</MainContentWrapper>
		</CheckoutWrapper>
	);
}

export const CheckoutStep = ( {
	activeStepContent,
	activeStepFooter,
	activeStepHeader,
	completeStepContent,
	titleContent,
	stepId,
	className,
	isCompleteCallback,
	canEditStep = true,
	editButtonText,
	editButtonAriaLabel,
	nextStepButtonText,
	nextStepButtonAriaLabel,
	validatingButtonText,
	validatingButtonAriaLabel,
}: CheckoutStepProps ) => {
	const { __ } = useI18n();
	const { actions } = useContext( CheckoutStepGroupContext );
	const {
		setActiveStepNumber,
		setStepCompleteStatus,
		setStepCompleteCallback,
		getStepCompleteCallback,
	} = actions;
	const { stepNumber, nextStepNumber, isStepActive, isStepComplete, areStepsActive } = useContext(
		CheckoutSingleStepDataContext
	);
	const { onPageLoadError } = useContext( CheckoutContext );
	const { formStatus, setFormValidating, setFormReady } = useFormStatus();
	const makeStepActive = useMakeStepActive();
	const setThisStepCompleteStatus = ( newStatus: boolean ) =>
		setStepCompleteStatus( { [ stepNumber ]: newStatus } );

	const goToThisStep = () => makeStepActive( stepId );

	// This is the callback called when you press "Continue" on a step.
	const goToNextStep = async () => {
		setFormValidating();
		// Wrapping isCompleteCallback in Promise.resolve allows it to return a Promise or boolean.
		const completeResult = Boolean( await Promise.resolve( isCompleteCallback() ) );
		debug( `isCompleteCallback for step ${ stepNumber } finished with`, completeResult );
		setThisStepCompleteStatus( completeResult );
		if ( completeResult && nextStepNumber !== null ) {
			setActiveStepNumber( nextStepNumber );
		}
		setFormReady();
		return completeResult;
	};
	setStepCompleteCallback( stepNumber, stepId, goToNextStep );

	const classNames = [
		'checkout-step',
		...( isStepActive ? [ 'is-active' ] : [] ),
		...( isStepComplete ? [ 'is-complete' ] : [] ),
		...( className ? [ className ] : [] ),
	];

	const onError = useCallback(
		( error: Error ) => onPageLoadError?.( 'step_load', error, { step_id: stepId } ),
		[ onPageLoadError, stepId ]
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
			canEditStep={ canEditStep }
			stepNumber={ stepNumber }
			stepId={ stepId }
			titleContent={ titleContent }
			goToThisStep={ areStepsActive ? goToThisStep : undefined }
			goToNextStep={
				nextStepNumber && nextStepNumber > 0 ? getStepCompleteCallback( stepNumber ) : undefined
			}
			activeStepContent={
				<>
					{ activeStepHeader }
					{ activeStepContent }
					{ activeStepFooter }
				</>
			}
			formStatus={ formStatus }
			completeStepContent={ completeStepContent }
			className={ joinClasses( classNames ) }
		/>
	);
};
CheckoutStep.isCheckoutStep = true;

export const CheckoutStepAreaWrapper = styled.div`
	background: ${ ( props ) => props.theme.colors.surface };
	box-sizing: border-box;
	margin: 0 auto;
	display: flex;
	flex-direction: column;
	align-items: flex-end;

	&.checkout__step-wrapper--last-step {
		margin-bottom: var( ${ customPropertyForSubmitButtonHeight }, 100px );
	}

	@media ( ${ ( props ) => props.theme.breakpoints.tabletUp } ) {
		&.checkout__step-wrapper--last-step {
			margin-bottom: 0;
		}
	}

	@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
		margin: 0;
	}
`;

export const SubmitButtonWrapper = styled.div`
	background: ${ ( props ) => props.theme.colors.surface };
	padding: 24px;
	bottom: 0;
	left: 0;
	box-sizing: border-box;
	width: 100%;
	z-index: 10;

	.checkout__step-wrapper--last-step & {
		position: fixed;
		box-shadow: 0 -3px 10px 0 #0000001f;
	}

	.rtl & {
		right: 0;
		left: auto;
	}

	.checkout-button {
		margin: 0 auto;
	}

	@media ( ${ ( props ) => props.theme.breakpoints.tabletUp } ) {
		.checkout-button {
			width: 100%;
		}

		.checkout__step-wrapper--last-step & {
			position: relative;
			box-shadow: none;
		}

		.checkout__step-wrapper & {
			padding: 24px 0px 24px 40px;

			.rtl & {
				padding: 24px 40px 24px 0px;
			}
		}
	}
`;

// Set right padding so that text doesn't overlap with inline help floating button.
export const SubmitFooterWrapper = styled.div`
	padding-right: 0;
	min-height: 45px;

	@media ( ${ ( props ) => props.theme.breakpoints.tabletUp } ) {
		padding-right: 0;
	}
`;

function CheckoutStepArea( {
	children,
	className,
}: PropsWithChildren< {
	className?: string;
} > ) {
	const { state } = useContext( CheckoutStepGroupContext );
	const { activeStepNumber, totalSteps } = state;
	const isThereAnotherNumberedStep = activeStepNumber < totalSteps;

	const classNames = joinClasses( [
		'checkout__step-wrapper',
		...( className ? [ className ] : [] ),
		...( ! isThereAnotherNumberedStep ? [ 'checkout__step-wrapper--last-step' ] : [] ),
	] );

	return <CheckoutStepAreaWrapper className={ classNames }>{ children }</CheckoutStepAreaWrapper>;
}

export function CheckoutFormSubmit( {
	validateForm,
	submitButtonHeader,
	submitButtonFooter,
	disableSubmitButton,
	submitButton,
}: {
	validateForm?: () => Promise< boolean >;
	submitButtonHeader?: ReactNode;
	submitButtonFooter?: ReactNode;
	disableSubmitButton?: boolean;
	submitButton?: ReactNode;
} ) {
	const { state } = useContext( CheckoutStepGroupContext );
	const { activeStepNumber, totalSteps, stepCompleteStatus } = state;
	const isThereAnotherNumberedStep = activeStepNumber < totalSteps;
	const areAllStepsComplete = Object.values( stepCompleteStatus ).every(
		( isComplete ) => isComplete === true
	);
	const { onPageLoadError } = useContext( CheckoutContext );
	const onSubmitButtonLoadError = useCallback(
		( error: Error ) => onPageLoadError?.( 'submit_button_load', error ),
		[ onPageLoadError ]
	);

	const submitWrapperRef = useCustomPropertyForHeight< HTMLDivElement >(
		customPropertyForSubmitButtonHeight
	);

	const isDisabled = ( () => {
		if ( disableSubmitButton ) {
			return true;
		}
		if ( activeStepNumber === 0 && areAllStepsComplete ) {
			// We enable the submit button if no step is active and all the steps are
			// complete so that we have the option of marking all steps as complete.
			return false;
		}
		if ( isThereAnotherNumberedStep ) {
			// If there is another step after the active one, we disable the submit
			// button so you have to complete the step first.
			return true;
		}
		return false;
	} )();
	return (
		<SubmitButtonWrapper className="checkout-steps__submit-button-wrapper" ref={ submitWrapperRef }>
			{ submitButtonHeader || null }
			{ submitButton || (
				<CheckoutSubmitButton
					validateForm={ validateForm }
					disabled={ isDisabled }
					onLoadError={ onSubmitButtonLoadError }
				/>
			) }
			<SubmitFooterWrapper className="checkout-steps__submit-footer-wrapper">
				{ submitButtonFooter || null }
			</SubmitFooterWrapper>
		</SubmitButtonWrapper>
	);
}

const StepWrapper = styled.div< HTMLAttributes< HTMLDivElement > >`
	position: relative;
	padding: 24px;
	width: 100%;
	box-sizing: border-box;

	@media ( ${ ( props ) => props.theme.breakpoints.tabletUp } ) {
		padding: 50px 0 0 0;
	}
`;

const StepContentWrapper = styled.div< StepContentWrapperProps & HTMLAttributes< HTMLDivElement > >`
	color: ${ ( props ) => props.theme.colors.textColor };
	display: ${ ( props ) => ( props.isVisible ? 'block' : 'none' ) };
	box-sizing: border-box;

	@media ( ${ ( props ) => props.theme.breakpoints.tabletUp } ) {
		padding-left: 40px;
	}

	.rtl & {
		@media ( ${ ( props ) => props.theme.breakpoints.tabletUp } ) {
			padding-left: 0;
			padding-right: 40px;
		}
	}
`;

interface StepContentWrapperProps {
	isVisible?: boolean;
}

const StepSummaryWrapper = styled.div< StepContentWrapperProps & HTMLAttributes< HTMLDivElement > >`
	color: ${ ( props ) => props.theme.colors.textColorLight };
	font-size: 14px;
	display: ${ ( props ) => ( props.isVisible ? 'block' : 'none' ) };
	box-sizing: border-box;

	@media ( ${ ( props ) => props.theme.breakpoints.tabletUp } ) {
		padding-left: 40px;
	}

	.rtl & {
		@media ( ${ ( props ) => props.theme.breakpoints.tabletUp } ) {
			padding-left: 0;
			padding-right: 40px;
		}
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
	canEditStep,
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
}: CheckoutStepBodyProps ) {
	const { __ } = useI18n();

	// Since both the active and inactive step content can be mounted at the same
	// time (by design so that both may hold state in form elements), these
	// test-ids can be used for tests to differentiate which version of a step is
	// currently visible.
	const activeStepTestId = isStepActive ? `${ stepId }--visible` : `${ stepId }--invisible`;
	const completeStepTestId = isStepActive ? `${ stepId }--invisible` : `${ stepId }--visible`;

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
					canEditStep={ canEditStep }
					onEdit={
						formStatus === FormStatus.READY && isStepComplete && goToThisStep && ! isStepActive
							? goToThisStep
							: undefined
					}
					editButtonText={ editButtonText || __( 'Edit' ) }
					editButtonAriaLabel={ editButtonAriaLabel || __( 'Edit this step' ) }
				/>
				<StepContentWrapper
					data-testid={ activeStepTestId }
					isVisible={ isStepActive }
					className="checkout-steps__step-content"
				>
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
						data-testid={ completeStepTestId }
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
	onError?: ( error: Error ) => void;
	editButtonAriaLabel?: string;
	editButtonText?: string;
	nextStepButtonText?: string;
	nextStepButtonAriaLabel?: string;
	isStepActive: boolean;
	isStepComplete: boolean;
	canEditStep?: boolean;
	className?: string;
	stepNumber?: number;
	stepId: string;
	titleContent: ReactNode;
	goToThisStep?: () => void;
	goToNextStep?: () => void;
	activeStepContent?: ReactNode;
	formStatus?: FormStatus;
	completeStepContent?: ReactNode;
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
	canEditStep: PropTypes.bool,
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
	const { state } = useContext( CheckoutStepGroupContext );
	const { stepNumber } = useContext( CheckoutSingleStepDataContext );
	return state.activeStepNumber === stepNumber;
}

export function useIsStepComplete(): boolean {
	const { state } = useContext( CheckoutStepGroupContext );
	const { stepNumber } = useContext( CheckoutSingleStepDataContext );
	return !! state.stepCompleteStatus[ stepNumber ];
}

export function useSetStepComplete(): SetStepComplete {
	const store = useContext( CheckoutStepGroupContext );
	return store.actions.setStepComplete;
}

export function useMakeStepActive(): MakeStepActive {
	const store = useContext( CheckoutStepGroupContext );
	return store.actions.makeStepActive;
}

const StepTitle = styled.span< StepTitleProps & HTMLAttributes< HTMLSpanElement > >`
	color: ${ ( props ) =>
		props.isActive || props.isComplete
			? props.theme.colors.textColorDark
			: props.theme.colors.textColorDisabled };
	font-weight: ${ ( props ) => props.theme.weights.bold };
	margin-right: ${ ( props ) => ( props.fullWidth ? '0' : '8px' ) };
	flex: 1;

	.rtl & {
		margin-right: 0;
		margin-left: ${ ( props ) => ( props.fullWidth ? '0' : '8px' ) };
	}
`;

interface StepTitleProps {
	isComplete?: boolean;
	isActive?: boolean;
	fullWidth?: boolean;
}

const StepHeader = styled.h2< StepHeaderProps & HTMLAttributes< HTMLHeadingElement > >`
	font-size: 20px;
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
	canEditStep,
	onEdit,
	editButtonText,
	editButtonAriaLabel,
}: {
	id: string;
	className?: string;
	stepNumber?: number;
	title: ReactNode;
	isActive?: boolean;
	isComplete?: boolean;
	canEditStep?: boolean;
	onEdit?: () => void;
	editButtonText?: string;
	editButtonAriaLabel?: string;
} ) {
	const { __ } = useI18n();
	const shouldShowEditButton = canEditStep && !! onEdit;

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
				fullWidth={ ! shouldShowEditButton }
				isComplete={ isComplete }
				isActive={ isActive }
			>
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
	width: 26px;
	height: 26px;
	margin-right: 8px;

	.rtl & {
		margin-right: 0;
		margin-left: 8px;
	}

	@media ( ${ ( props ) => props.theme.breakpoints.tabletUp } ) {
		margin-right: 12px;

		.rtl & {
			margin-right: 0;
			margin-left: 12px;
		}
	}
`;

const StepNumberInnerWrapper = styled.div<
	StepNumberInnerWrapperProps & HTMLAttributes< HTMLDivElement >
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

const StepNumber = styled.div< StepNumberProps & HTMLAttributes< HTMLDivElement > >`
	display: flex;
	align-items: center;
	justify-content: center;
	background: ${ ( props ) => props.theme.colors.surface };
	font-weight: normal;
	font-size: 16px;
	width: 26px;
	height: 26px;
	box-sizing: border-box;
	text-align: center;
	border-radius: 50%;
	border-width: 1px;
	border-style: solid;
	border-color: ${ ( props ) =>
		props.isActive ? props.theme.colors.textColor : props.theme.colors.textColorDisabled };
	color: ${ ( props ) =>
		props.isActive ? props.theme.colors.textColor : props.theme.colors.textColorDisabled };
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
	border-color: ${ ( props ) => props.theme.colors.success };
	transform: rotateY( 180deg );
	// Reason: media query needs to not have spaces within brackets otherwise ie11 doesn't read them
	// prettier-ignore
	@media all and (-ms-high-contrast:none), (-ms-high-contrast:active) {
		backface-visibility: visible;
		z-index: ${ ( props ) => ( props.isComplete ? '1' : '0' ) };
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
	children?: ReactNode;
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

export function CheckoutStepGroup( {
	children,
	areStepsActive,
	stepAreaHeader,
	store,
	onStepChanged,
	loadingContent,
	loadingHeader,
}: PropsWithChildren< {
	areStepsActive?: boolean;
	stepAreaHeader?: ReactNode;
	store?: CheckoutStepGroupStore;
	onStepChanged?: StepChangedCallback;
	loadingContent?: ReactNode;
	loadingHeader?: ReactNode;
} > ) {
	const stepGroupStore = useMemo( () => store || createCheckoutStepGroupStore(), [ store ] );
	return (
		<CheckoutStepGroupWrapper
			store={ stepGroupStore }
			loadingContent={ loadingContent }
			loadingHeader={ loadingHeader }
			onStepChanged={ onStepChanged }
		>
			{ stepAreaHeader }
			<CheckoutStepArea>
				<CheckoutStepGroupInner areStepsActive={ areStepsActive }>
					{ children }
				</CheckoutStepGroupInner>
			</CheckoutStepArea>
		</CheckoutStepGroupWrapper>
	);
}

const paymentMethodStepProps = getDefaultPaymentMethodStep();
export function PaymentMethodStep( props: Partial< CheckoutStepProps > ) {
	return <CheckoutStep { ...{ ...paymentMethodStepProps, ...props } } />;
}
PaymentMethodStep.isCheckoutStep = true;
