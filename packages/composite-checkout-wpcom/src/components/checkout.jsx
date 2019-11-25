/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslate } from 'i18n-calypso';
import {
	Checkout,
	CheckoutProvider,
	getDefaultPaymentMethodStep,
	useIsStepActive,
} from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import WPCheckoutOrderReview from './wp-checkout-order-review';
import WPCheckoutOrderSummary, { WPCheckoutOrderSummaryTitle } from './wp-checkout-order-summary';
import WPContactForm from './wp-contact-form';

// These are used only for non-redirect payment methods
// TODO: write this
const onSuccess = () => alert( 'Payment succeeded!' );
const onFailure = error => alert( 'There was a problem with your payment' + error );

// These are used only for redirect payment methods
const successRedirectUrl = window.location.href;
const failureRedirectUrl = window.location.href;

// Called when the store is changed.
const handleCheckoutEvent = _ => () => {
	// TODO: write this
};

const ContactFormTitle = () => {
	const translate = useTranslate();
	const isActive = useIsStepActive();
	return isActive ? translate( 'Billing details' ) : translate( 'Enter your billing details' );
};

const OrderReviewTitle = () => {
	const translate = useTranslate();
	return translate( 'Review your order' );
};

// This is the parent component which would be included on a host page
export function WPCOMCheckout( { useShoppingCart, availablePaymentMethods, registry } ) {
	const translate = useTranslate();
	const { items, tax, total, removeItem } = useShoppingCart();
	const { select, subscribe } = registry;

	useEffect( () => {
		return subscribe( handleCheckoutEvent( select ) );
	}, [ select, subscribe ] );

	const ReviewContent = () => (
		<WPCheckoutOrderReview className={ 'checkout__order-review-step' } removeItem={ removeItem } />
	);

	// TODO: should we memoize this?
	const steps = [
		{
			id: 'order-summary',
			className: 'checkout__order-summary-step',
			hasStepNumber: false,
			titleContent: <WPCheckoutOrderSummaryTitle />,
			completeStepContent: <WPCheckoutOrderSummary />,
			isCompleteCallback: () => true,
		},
		{
			...getDefaultPaymentMethodStep(),
			getEditButtonAriaLabel: () => translate( 'Edit the payment method' ),
			getNextStepButtonAriaLabel: () => translate( 'Continue with the selected payment method' ),
		},
		{
			id: 'contact-form',
			className: 'checkout__billing-details-step',
			hasStepNumber: true,
			titleContent: <ContactFormTitle />,
			activeStepContent: <WPContactForm isComplete={ false } isActive={ true } />,
			completeStepContent: <WPContactForm summary isComplete={ true } isActive={ false } />,
			isCompleteCallback: ( { paymentData } ) => {
				// TODO: Make sure the form is complete
				const { billing = {} } = paymentData;
				if ( ! billing.country ) {
					return false;
				}
				return true;
			},
			isEditableCallback: ( { paymentData } ) => {
				// TODO: Return true if the form is empty
				if ( paymentData.billing ) {
					return true;
				}
				return false;
			},
			getEditButtonAriaLabel: () => translate( 'Edit the billing details' ),
			getNextStepButtonAriaLabel: () => translate( 'Continue with the entered billing details' ),
		},
		{
			id: 'order-review',
			className: 'checkout__review-order-step',
			hasStepNumber: true,
			titleContent: <OrderReviewTitle />,
			activeStepContent: <ReviewContent />,
			isCompleteCallback: ( { activeStep } ) => {
				const isActive = activeStep.id === 'order-review';
				return isActive;
			},
		},
	];

	return (
		<CheckoutProvider
			locale={ 'en-us' }
			items={ [ ...items, tax ] }
			total={ total }
			onSuccess={ onSuccess }
			onFailure={ onFailure }
			successRedirectUrl={ successRedirectUrl }
			failureRedirectUrl={ failureRedirectUrl }
			paymentMethods={ availablePaymentMethods }
			registry={ registry }
		>
			<Checkout steps={ steps } />
		</CheckoutProvider>
	);
}

WPCOMCheckout.propTypes = {
	availablePaymentMethods: PropTypes.arrayOf( PropTypes.object ).isRequired,
	useShoppingCart: PropTypes.func.isRequired,
	registry: PropTypes.object.isRequired,
};
