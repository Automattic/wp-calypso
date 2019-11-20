/**
 * External dependencies
 */
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';

/**
 * Internal dependencies
 */
import joinClasses from '../lib/join-classes';
import { useLocalize, sprintf } from '../lib/localize';
import CheckoutStep from './checkout-step';
import CheckoutNextStepButton from './checkout-next-step-button';
import CheckoutSubmitButton from './checkout-submit-button';
import {
	usePrimarySelect,
	usePrimaryDispatch,
	useRegisterPrimaryStore,
	usePaymentData,
} from '../lib/registry';
import CheckoutErrorBoundary from './checkout-error-boundary';
import { useActiveStep, ActiveStepProvider } from '../lib/active-step';
import CheckoutOrderSummary, { CheckoutOrderSummaryTitle } from './checkout-order-summary';
import CheckoutReviewOrder, { CheckoutReviewOrderTitle } from './checkout-review-order';
import CheckoutPaymentMethods, { CheckoutPaymentMethodsTitle } from './checkout-payment-methods';

function useRegisterCheckoutStore() {
	useRegisterPrimaryStore( {
		reducer( state = { stepNumber: 1, paymentData: {} }, action ) {
			switch ( action.type ) {
				case 'STEP_NUMBER_SET':
					return { ...state, stepNumber: action.payload };
				case 'PAYMENT_DATA_UPDATE':
					return {
						...state,
						paymentData: { ...state.paymentData, [ action.payload.key ]: action.payload.value },
					};
			}
			return state;
		},
		actions: {
			changeStep( payload ) {
				return { type: 'STEP_NUMBER_SET', payload };
			},
			updatePaymentData( key, value ) {
				return { type: 'PAYMENT_DATA_UPDATE', payload: { key, value } };
			},
		},
		selectors: {
			getStepNumber( state ) {
				return state.stepNumber;
			},
			getPaymentData( state ) {
				return state.paymentData;
			},
		},
	} );
}

export default function Checkout( { steps, className } ) {
	useRegisterCheckoutStore();
	const localize = useLocalize();

	// stepNumber is the displayed number of the active step, not its index
	const stepNumber = usePrimarySelect( select => select().getStepNumber() );
	const { changeStep } = usePrimaryDispatch();
	steps = steps || makeDefaultSteps();

	// Assign step numbers to all steps with numbers
	const annotatedSteps = useMemo( () => {
		let numberedStepNumber = 0;
		return steps.map( ( step, index ) => {
			numberedStepNumber = step.hasStepNumber ? numberedStepNumber + 1 : numberedStepNumber;
			return step.hasStepNumber
				? { ...step, stepNumber: numberedStepNumber, stepIndex: index }
				: step;
		} );
	}, [ steps ] );

	if ( annotatedSteps.length < 1 ) {
		throw new Error( 'No steps found' );
	}

	const activeStep = annotatedSteps.find( step => step.stepNumber === stepNumber );
	if ( ! activeStep ) {
		throw new Error( 'There is no active step' );
	}

	const nextStep = annotatedSteps.find( ( step, index ) => {
		return index > activeStep.stepIndex && step.hasStepNumber;
	} );
	const isThereAnotherNumberedStep = nextStep && nextStep.hasStepNumber;

	return (
		<Container className={ joinClasses( [ className, 'composite-checkout' ] ) }>
			<MainContent className={ joinClasses( [ className, 'checkout__content' ] ) }>
				<ActiveStepProvider step={ activeStep }>
					{ annotatedSteps.map( step => (
						<CheckoutStepContainer
							{ ...step }
							key={ step.id }
							stepNumber={ step.stepNumber || null }
							shouldShowNextButton={
								step.hasStepNumber && step.id === activeStep.id && isThereAnotherNumberedStep
							}
							goToNextStep={ () => changeStep( nextStep.stepNumber ) }
							onEdit={
								step.isEditableCallback && step.isEditableCallback()
									? () => changeStep( step.stepNumber )
									: null
							}
						/>
					) ) }
				</ActiveStepProvider>

				<CheckoutWrapper>
					<CheckoutErrorBoundary
						errorMessage={ localize( 'There was a problem with the submit button.' ) }
					>
						<CheckoutSubmitButton isActive={ ! isThereAnotherNumberedStep } />
					</CheckoutErrorBoundary>
				</CheckoutWrapper>
			</MainContent>
		</Container>
	);
}

Checkout.propTypes = {
	className: PropTypes.string,
	steps: PropTypes.array,
};

function CheckoutStepContainer( {
	id,
	titleContent,
	className,
	activeStepContent,
	incompleteStepContent,
	completeStepContent,
	isCompleteCallback,
	stepNumber,
	shouldShowNextButton,
	goToNextStep,
	getNextStepButtonLabel,
	onEdit,
	getEditButtonAriaLabel,
} ) {
	const localize = useLocalize();
	const currentStep = useActiveStep();
	const [ paymentData ] = usePaymentData();
	const isActive = currentStep.id === id;
	const isComplete = !! isCompleteCallback( { paymentData } );

	return (
		<CheckoutErrorBoundary
			errorMessage={ sprintf( localize( 'There was a problem with the step "%s".' ), id ) }
		>
			<CheckoutStep
				className={ className }
				isActive={ isActive }
				isComplete={ isComplete }
				stepNumber={ stepNumber }
				title={ titleContent }
				onEdit={ ! isActive && isComplete ? onEdit : null }
				editButtonAriaLabel={ getEditButtonAriaLabel && getEditButtonAriaLabel( localize ) }
				stepContent={
					<React.Fragment>
						{ activeStepContent }
						{ shouldShowNextButton && (
							<CheckoutNextStepButton
								value={ localize( 'Continue' ) }
								onClick={ goToNextStep }
								ariaLabel={ getNextStepButtonLabel && getNextStepButtonLabel( localize ) }
							/>
						) }
					</React.Fragment>
				}
				stepSummary={ isComplete ? completeStepContent : incompleteStepContent }
			/>
		</CheckoutErrorBoundary>
	);
}

const Container = styled.div`
	*:focus {
		outline: ${props => props.theme.colors.outline} solid 2px;
	}
`;

const MainContent = styled.div`
	background: ${props => props.theme.colors.surface};
	width: 100%;
	box-sizing: border-box;

	@media ( ${props => props.theme.breakpoints.tabletUp} ) {
		border: 1px solid ${props => props.theme.colors.borderColorLight};
		margin: 32px auto;
		box-sizing: border-box;
		max-width: 556px;
	}
`;

const CheckoutWrapper = styled.div`
	background: ${props => props.theme.colors.background};
	padding: 24px;
`;

function makeDefaultSteps() {
	return [
		{
			id: 'order-summary',
			className: 'checkout__order-summary-step',
			hasStepNumber: false,
			titleContent: <CheckoutOrderSummaryTitle />,
			activeStepContent: null,
			incompleteStepContent: null,
			completeStepContent: <CheckoutOrderSummary />,
			isCompleteCallback: () => true,
		},
		{
			id: 'payment-method',
			className: 'checkout__payment-methods-step',
			hasStepNumber: true,
			titleContent: <CheckoutPaymentMethodsTitle />,
			activeStepContent: <CheckoutPaymentMethods isComplete={ false } />,
			incompleteStepContent: null,
			completeStepContent: <CheckoutPaymentMethods summary isComplete={ true } />,
			isCompleteCallback: () => true,
			isEditableCallback: () => true,
			getEditButtonAriaLabel: localize => localize( 'Edit the payment method' ),
			getNextStepButtonLabel: localize => localize( 'Continue with the selected payment method' ),
		},
		{
			id: 'order-review',
			className: 'checkout__review-order-step',
			hasStepNumber: true,
			titleContent: <CheckoutReviewOrderTitle />,
			activeStepContent: <CheckoutReviewOrder />,
			incompleteStepContent: null,
			completeStepContent: null,
			isCompleteCallback: () => true,
		},
	];
}
