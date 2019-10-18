/* @format */

/**
 * External dependencies
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ThemeProvider } from 'styled-components';

/**
 * Internal dependencies
 */
import joinClasses from '../lib/join-classes';
import localizeFactory, { useLocalize } from '../lib/localize';
import { Container, LeftColumn, PageTitle } from './basics';
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
	onChangeBillingContact,
	availablePaymentMethods,
	onSuccess,
	onFailure,
	successRedirectUrl,
	failureRedirectUrl,
	upSell,
	checkoutHeader,
	className,
} ) {
	const localize = localizeFactory( locale );
	const [ stepNumber, setStepNumber ] = useState( 1 );

	return (
		<ThemeProvider theme={ theme }>
			<CheckoutProvider
				localize={ localize }
				items={ items }
				total={ total }
				onSuccess={ onSuccess }
				onFailure={ onFailure }
				successRedirectUrl={ successRedirectUrl }
				failureRedirectUrl={ failureRedirectUrl }
			>
				<Container className={ joinClasses( [ className, 'checkout' ] ) }>
					<LeftColumn>
						<div>
							{ checkoutHeader || <PageTitle>{ localize( 'Complete your purchase' ) }</PageTitle> }
						</div>
						<PaymentMethodsStep
							availablePaymentMethods={ availablePaymentMethods }
							setStepNumber={ setStepNumber }
							isActive={ stepNumber === 1 }
							isComplete={ stepNumber > 1 }
						/>
						<BillingDetailsStep
							setStepNumber={ setStepNumber }
							isActive={ stepNumber === 2 }
							isComplete={ stepNumber > 2 }
							onChangeBillingContact={ onChangeBillingContact }
						/>
						<ReviewOrderStep
							setStepNumber={ setStepNumber }
							isActive={ stepNumber === 3 }
							isComplete={ stepNumber > 3 }
						/>
						<CheckoutSubmitButton isActive={ stepNumber === 3 } />
						{ upSell && <div>{ upSell }</div> }
					</LeftColumn>
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
	onChangeBillingContact: PropTypes.func,
	availablePaymentMethods: PropTypes.arrayOf( PropTypes.string ),
	onSuccess: PropTypes.func.isRequired,
	onFailure: PropTypes.func.isRequired,
	successRedirectUrl: PropTypes.string.isRequired,
	failureRedirectUrl: PropTypes.string.isRequired,
	reviewContent: PropTypes.element,
	reviewContentCollapsed: PropTypes.element,
	upSell: PropTypes.element,
	checkoutHeader: PropTypes.element,
	orderReviewTOS: PropTypes.element,
	orderReviewFeatures: PropTypes.element,
};

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

function BillingDetailsStep( { isActive, isComplete, setStepNumber, onChangeBillingContact } ) {
	const localize = useLocalize();
	const [ paymentData, setPaymentData ] = usePaymentMethodData();
	const paymentMethod = usePaymentMethod();
	if ( ! paymentMethod ) {
		throw new Error( 'Cannot render Billing details without a payment method' );
	}
	const { BillingContactComponent } = paymentMethod;
	// Call onChangeBillingContact as a side effect in case the parent wants to update the items
	const setBillingData = newData => {
		onChangeBillingContact && onChangeBillingContact( newData );
		setPaymentData( newData );
	};

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
				stepContent={
					<React.Fragment>
						<BillingContactComponent
							paymentData={ paymentData }
							setPaymentData={ setBillingData }
							isActive={ isActive }
							isComplete={ isComplete }
						/>
						<CheckoutNextStepButton
							value={ localize( 'Continue' ) }
							onClick={ () => setStepNumber( 3 ) }
						/>
					</React.Fragment>
				}
				stepSummary={
					<BillingContactComponent
						summary
						paymentData={ paymentData }
						setPaymentData={ setBillingData }
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
	onChangeBillingContact: PropTypes.func,
};

function ReviewOrderStep( { isActive, isComplete } ) {
	const localize = useLocalize();

	return (
		<React.Fragment>
			<CheckoutStep
				finalStep
				isActive={ isActive }
				isComplete={ isComplete }
				stepNumber={ 3 }
				title={ isComplete ? localize( 'Review your order' ) : localize( 'Review your order' ) }
				showSummary={ true }
				stepContent={ <CheckoutReviewOrder isActive={ isActive } /> }
				stepSummary={ <CheckoutReviewOrder summary isActive={ isActive } /> }
			/>
		</React.Fragment>
	);
}

ReviewOrderStep.propTypes = {
	isActive: PropTypes.bool.isRequired,
	isComplete: PropTypes.bool.isRequired,
};
