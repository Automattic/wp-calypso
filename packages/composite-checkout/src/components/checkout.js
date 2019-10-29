/**
 * External dependencies
 */
import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import styled, { ThemeProvider } from 'styled-components';

/**
 * Internal dependencies
 */
import joinClasses from '../lib/join-classes';
import localizeFactory, { useLocalize } from '../lib/localize';
import { CheckoutProvider } from './checkout-provider';
import CheckoutStep from './checkout-step';
import CheckoutPaymentMethods from './checkout-payment-methods';
import { usePaymentMethodData, usePaymentMethod, usePaymentMethodId } from '../lib/payment-methods';
import theme from '../theme';
import CheckoutNextStepButton from './checkout-next-step-button';
import CheckoutReviewOrder from './checkout-review-order';
import CheckoutSubmitButton from './checkout-submit-button';

export default function Checkout( {
	locale,
	items,
	total,
	availablePaymentMethods,
	dispatchPaymentAction,
	paymentData,
	onSuccess,
	onFailure,
	successRedirectUrl,
	failureRedirectUrl,
	ReviewContent,
	UpSell,
	CheckoutHeader,
	className,
} ) {
	const localize = localizeFactory( locale );
	const [ stepNumber, setStepNumber ] = useState( 1 );
	const changeStep = useCallback(
		nextStep => {
			setStepNumber( prevStep => {
				dispatchPaymentAction( {
					type: 'STEP_CHANGED',
					payload: { prevStep, nextStep },
				} );
				return nextStep;
			} );
		},
		[ dispatchPaymentAction ]
	);

	return (
		<ThemeProvider theme={ theme }>
			<CheckoutProvider
				dispatchPaymentAction={ dispatchPaymentAction }
				paymentData={ paymentData }
				localize={ localize }
				items={ items }
				total={ total }
				onSuccess={ onSuccess }
				onFailure={ onFailure }
				successRedirectUrl={ successRedirectUrl }
				failureRedirectUrl={ failureRedirectUrl }
			>
				<Container className={ joinClasses( [ className, 'checkout' ] ) }>
					<MainContent>
						<div>
							{ CheckoutHeader ? (
								<CheckoutHeader />
							) : (
								<PageTitle>{ localize( 'Complete your purchase' ) }</PageTitle>
							) }
						</div>
						<PaymentMethodsStep
							availablePaymentMethods={ availablePaymentMethods }
							setStepNumber={ changeStep }
							isActive={ stepNumber === 1 }
							isComplete={ stepNumber > 1 }
						/>
						<BillingDetailsStep
							setStepNumber={ changeStep }
							isActive={ stepNumber === 2 }
							isComplete={ stepNumber > 2 }
						/>
						<ReviewOrderStep
							setStepNumber={ changeStep }
							isActive={ stepNumber === 3 }
							isComplete={ stepNumber > 3 }
							ReviewContent={ ReviewContent }
						/>
						<CheckoutSubmitButton isActive={ stepNumber === 3 } />
						{ UpSell && <UpSell /> }
					</MainContent>
				</Container>
			</CheckoutProvider>
		</ThemeProvider>
	);
}

Checkout.propTypes = {
	className: PropTypes.string,
	locale: PropTypes.string.isRequired,
	items: PropTypes.array.isRequired,
	total: PropTypes.object.isRequired,
	availablePaymentMethods: PropTypes.arrayOf( PropTypes.string ),
	paymentData: PropTypes.object.isRequired,
	dispatchPaymentAction: PropTypes.func.isRequired,
	onSuccess: PropTypes.func.isRequired,
	onFailure: PropTypes.func.isRequired,
	successRedirectUrl: PropTypes.string.isRequired,
	failureRedirectUrl: PropTypes.string.isRequired,
	ReviewContent: PropTypes.elementType,
	UpSell: PropTypes.elementType,
	CheckoutHeader: PropTypes.elementType,
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

const Column = styled.div`
	background: ${props => props.theme.colors.surface};
	padding: 16px;
	width: 100%;
	box-sizing: border-box;
	@media ( ${props => props.theme.breakpoints.tabletUp} ) {
		border: 1px solid ${props => props.theme.colors.borderColorLight};
		margin-top: 32px;
		box-sizing: border-box;
		padding: 24px;
	}
`;

const MainContent = styled( Column )`
	@media ( ${props => props.theme.breakpoints.tabletUp} ) {
		max-width: 532px;
	}
`;

const PageTitle = styled.h1`
	margin: 0;
	font-weight: normal;
	font-size: 24px;
	color: ${props => props.theme.colors.textColorDark};
	padding-bottom: 24px;
`;

function PaymentMethodsStep( { setStepNumber, isActive, isComplete, availablePaymentMethods } ) {
	const localize = useLocalize();
	const paymentMethod = usePaymentMethod();
	const [ , setPaymentMethod ] = usePaymentMethodId();

	return (
		<React.Fragment>
			<CheckoutStep
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
		</React.Fragment>
	);
}

PaymentMethodsStep.propTypes = {
	setStepNumber: PropTypes.func.isRequired,
	isActive: PropTypes.bool.isRequired,
	isComplete: PropTypes.bool.isRequired,
	availablePaymentMethods: PropTypes.arrayOf( PropTypes.string ),
};

function BillingDetailsStep( { isActive, isComplete, setStepNumber } ) {
	const localize = useLocalize();
	const [ paymentData, dispatch ] = usePaymentMethodData();
	const paymentMethod = usePaymentMethod();
	if ( ! paymentMethod ) {
		throw new Error( 'Cannot render Billing details without a payment method' );
	}
	const { BillingContactComponent } = paymentMethod;

	return (
		<React.Fragment>
			<CheckoutStep
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
						<BillingContactComponent
							paymentData={ paymentData }
							dispatch={ dispatch }
							isActive={ isActive }
							isComplete={ isComplete }
						/>
						<CheckoutNextStepButton
							value={ localize( 'Continue' ) }
							onClick={ () => setStepNumber( 3 ) }
							ariaLabel={ localize( 'Continue with the entered billing details' ) }
						/>
					</React.Fragment>
				}
				stepSummary={
					<BillingContactComponent
						summary
						paymentData={ paymentData }
						dispatch={ dispatch }
						isActive={ isActive }
						isComplete={ isComplete }
					/>
				}
			/>
		</React.Fragment>
	);
}

BillingDetailsStep.propTypes = {
	setStepNumber: PropTypes.func.isRequired,
	isActive: PropTypes.bool.isRequired,
	isComplete: PropTypes.bool.isRequired,
};

function ReviewOrderStep( { isActive, isComplete, ReviewContent } ) {
	const localize = useLocalize();

	return (
		<React.Fragment>
			<CheckoutStep
				finalStep
				isActive={ isActive }
				isComplete={ isComplete }
				stepNumber={ 3 }
				title={ isComplete ? localize( 'Review your order' ) : localize( 'Review your order' ) }
				stepContent={
					ReviewContent ? (
						<ReviewContent isActive={ isActive } />
					) : (
						<CheckoutReviewOrder isActive={ isActive } />
					)
				}
				stepSummary={
					ReviewContent ? (
						<ReviewContent summary isActive={ isActive } />
					) : (
						<CheckoutReviewOrder summary isActive={ isActive } />
					)
				}
			/>
		</React.Fragment>
	);
}

ReviewOrderStep.propTypes = {
	isActive: PropTypes.bool.isRequired,
	isComplete: PropTypes.bool.isRequired,
};
