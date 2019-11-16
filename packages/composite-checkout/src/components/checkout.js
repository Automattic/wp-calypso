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
import CheckoutStep from './checkout-step';
import CheckoutPaymentMethods from './checkout-payment-methods';
import { usePaymentMethod, usePaymentMethodId } from '../lib/payment-methods';
import CheckoutNextStepButton from './checkout-next-step-button';
import CheckoutReviewOrder from './checkout-review-order';
import CheckoutSubmitButton from './checkout-submit-button';
import { useSelect, useDispatch, useRegisterStore } from '../lib/registry';
import CheckoutErrorBoundary from './checkout-error-boundary';
import CheckoutOrderSummary from './checkout-order-summary';
import { useTotal, renderDisplayValueMarkdown } from '../public-api';

function useRegisterCheckoutStore() {
	useRegisterStore( 'checkout', {
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

export default function Checkout( {
	availablePaymentMethods,
	ReviewContent,
	UpSell,
	OrderSummary,
	ContactSlot,
	className,
} ) {
	useRegisterCheckoutStore();
	const localize = useLocalize();
	const stepNumber = useSelect( select => select( 'checkout' ).getStepNumber() );
	const { changeStep } = useDispatch( 'checkout' );

	return (
		<Container className={ joinClasses( [ className, 'checkout' ] ) }>
			<MainContent className={ joinClasses( [ className, 'checkout__content' ] ) }>
				<OrderSummaryStep OrderSummary={ OrderSummary || CheckoutOrderSummary } />

				<CheckoutErrorBoundary
					errorMessage={ localize( 'There was a problem with the payment method form.' ) }
				>
					<PaymentMethodsStep
						availablePaymentMethods={ availablePaymentMethods }
						setStepNumber={ changeStep }
						isActive={ stepNumber === 1 }
						isComplete={ stepNumber > 1 }
					/>
				</CheckoutErrorBoundary>
				<CheckoutErrorBoundary
					errorMessage={ localize( 'There was a problem with the billing contact form.' ) }
				>
					{ ContactSlot && (
						<BillingDetailsStep
							setStepNumber={ changeStep }
							isActive={ stepNumber === 2 }
							isComplete={ stepNumber > 2 }
							ContactSlot={ ContactSlot }
						/>
					) }
				</CheckoutErrorBoundary>
				<CheckoutErrorBoundary
					errorMessage={ localize( 'There was a problem with the review form.' ) }
				>
					<ReviewOrderStep
						setStepNumber={ changeStep }
						isActive={ stepNumber === 3 }
						isComplete={ stepNumber > 3 }
						ReviewContent={ ReviewContent }
					/>
				</CheckoutErrorBoundary>
				<CheckoutWrapper>
					<CheckoutErrorBoundary
						errorMessage={ localize( 'There was a problem with the submit button.' ) }
					>
						<CheckoutSubmitButton isActive={ stepNumber === 3 } />
					</CheckoutErrorBoundary>
				</CheckoutWrapper>

				{ UpSell && <UpSell /> }
			</MainContent>
		</Container>
	);
}

Checkout.propTypes = {
	className: PropTypes.string,
	availablePaymentMethods: PropTypes.arrayOf( PropTypes.string ),
	ReviewContent: PropTypes.elementType,
	UpSell: PropTypes.elementType,
	OrderSummary: PropTypes.elementType,
	ContactSlot: PropTypes.elementType,
};

const Container = styled.div`
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

function OrderSummaryStep( { OrderSummary } ) {
	const localize = useLocalize();
	const total = useTotal();

	return (
		<CheckoutStep
			isActive={ false }
			isComplete={ true }
			stepNumber={ 0 }
			title={
				<CheckoutSummaryTitle>
					<span>{ localize( 'You are all set to check out' ) }</span>
					<CheckoutSummaryTotal>
						{ renderDisplayValueMarkdown( total.amount.displayValue ) }
					</CheckoutSummaryTotal>
				</CheckoutSummaryTitle>
			}
			stepSummary={ <OrderSummary /> }
		/>
	);
}

OrderSummaryStep.propTypes = {
	OrderSummary: PropTypes.elementType,
};

const CheckoutSummaryTitle = styled.span`
	display: flex;
	justify-content: space-between;
`;

const CheckoutSummaryTotal = styled.span`
	font-weight: ${props => props.theme.weights.bold};
`;

function PaymentMethodsStep( { setStepNumber, isActive, isComplete, availablePaymentMethods } ) {
	const localize = useLocalize();
	const paymentMethod = usePaymentMethod();
	const [ , setPaymentMethod ] = usePaymentMethodId();

	return (
		<CheckoutStep
			className="checkout__payment-methods-step"
			isActive={ isActive }
			isComplete={ isComplete }
			stepNumber={ 1 }
			title={ isComplete ? localize( 'Payment method' ) : localize( 'Pick a payment method' ) }
			onEdit={ () => setStepNumber( 1 ) }
			editButtonAriaLabel={ localize( 'Edit the payment method' ) }
			stepContent={
				<React.Fragment>
					<CheckoutPaymentMethods
						isActive={ isActive }
						isComplete={ isComplete }
						availablePaymentMethods={ availablePaymentMethods }
						onChange={ setPaymentMethod }
						paymentMethod={ paymentMethod }
					/>

					<CheckoutNextStepButton
						value={ localize( 'Continue' ) }
						onClick={ () => setStepNumber( 2 ) }
						ariaLabel={ localize( 'Continue with the selected payment method' ) }
					/>
				</React.Fragment>
			}
			stepSummary={
				<CheckoutPaymentMethods
					summary
					isActive={ isActive }
					isComplete={ isComplete }
					availablePaymentMethods={ availablePaymentMethods }
					onChange={ setPaymentMethod }
					paymentMethod={ paymentMethod }
				/>
			}
		/>
	);
}

PaymentMethodsStep.propTypes = {
	setStepNumber: PropTypes.func.isRequired,
	isActive: PropTypes.bool.isRequired,
	isComplete: PropTypes.bool.isRequired,
	availablePaymentMethods: PropTypes.arrayOf( PropTypes.string ),
};

function BillingDetailsStep( { isActive, isComplete, setStepNumber, ContactSlot } ) {
	const localize = useLocalize();
	const paymentMethod = usePaymentMethod();
	if ( ! paymentMethod ) {
		throw new Error( 'Cannot render Billing details without a payment method' );
	}

	return (
		<CheckoutStep
			className="checkout__billing-details-step"
			isActive={ isActive }
			isComplete={ isComplete }
			stepNumber={ 2 }
			title={
				isComplete ? localize( 'Billing details' ) : localize( 'Enter your billing details' )
			}
			onEdit={ () => setStepNumber( 2 ) }
			editButtonAriaLabel={ localize( 'Edit the billing details' ) }
			stepContent={
				<React.Fragment>
					<ContactSlot isActive={ isActive } isComplete={ isComplete } />
					<CheckoutNextStepButton
						value={ localize( 'Continue' ) }
						onClick={ () => setStepNumber( 3 ) }
						ariaLabel={ localize( 'Continue with the entered billing details' ) }
					/>
				</React.Fragment>
			}
			stepSummary={ <ContactSlot summary isActive={ isActive } isComplete={ isComplete } /> }
		/>
	);
}

BillingDetailsStep.propTypes = {
	setStepNumber: PropTypes.func.isRequired,
	isActive: PropTypes.bool.isRequired,
	isComplete: PropTypes.bool.isRequired,
	ContactSlot: PropTypes.elementType.isRequired,
};

function ReviewOrderStep( { isActive, isComplete, ReviewContent } ) {
	const localize = useLocalize();

	return (
		<CheckoutStep
			finalStep
			className="checkout__review-order-step"
			isActive={ isActive }
			isComplete={ isComplete }
			stepNumber={ 3 }
			title={ localize( 'Review your order' ) }
			stepContent={
				ReviewContent ? (
					<ReviewContent isActive={ isActive } />
				) : (
					<CheckoutReviewOrder isActive={ isActive } />
				)
			}
		/>
	);
}

ReviewOrderStep.propTypes = {
	isActive: PropTypes.bool.isRequired,
	isComplete: PropTypes.bool.isRequired,
};
