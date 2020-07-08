/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import CheckoutOrderSummaryStep, {
	CheckoutOrderSummaryStepTitle,
	CheckoutOrderSummary,
} from './checkout-order-summary';
import CheckoutReviewOrder, { CheckoutReviewOrderTitle } from './checkout-review-order';
import CheckoutPaymentMethods, { CheckoutPaymentMethodsTitle } from './checkout-payment-methods';

export function getDefaultOrderSummary() {
	return {
		id: 'order-summary',
		className: 'checkout__order-summary',
		summaryContent: <CheckoutOrderSummary />,
	};
}

export function getDefaultOrderSummaryStep() {
	return {
		id: 'order-summary-step',
		className: 'checkout__order-summary-step',
		hasStepNumber: false,
		titleContent: <CheckoutOrderSummaryStepTitle />,
		activeStepContent: null,
		incompleteStepContent: null,
		completeStepContent: <CheckoutOrderSummaryStep />,
		isCompleteCallback: () => true,
	};
}

export function getDefaultPaymentMethodStep() {
	return {
		id: 'payment-method',
		className: 'checkout__payment-methods-step',
		hasStepNumber: true,
		titleContent: <CheckoutPaymentMethodsTitle />,
		activeStepContent: <CheckoutPaymentMethods isComplete={ false } />,
		incompleteStepContent: null,
		completeStepContent: <CheckoutPaymentMethods summary isComplete={ true } />,
		isEditableCallback: () => true,
		// These cannot be translated because they are not inside a component and
		// we don't know if they are being created by the package or the host page.
		// They can be replaced by the consumer to get translation.
		getEditButtonAriaLabel: () => 'Edit the payment method',
		getNextStepButtonAriaLabel: () => 'Continue with the selected payment method',
	};
}

export function getDefaultOrderReviewStep() {
	return {
		id: 'order-review',
		className: 'checkout__review-order-step',
		hasStepNumber: true,
		titleContent: <CheckoutReviewOrderTitle />,
		activeStepContent: <CheckoutReviewOrder />,
		incompleteStepContent: null,
		completeStepContent: null,
		isCompleteCallback: ( { activeStep } ) => {
			const isActive = activeStep.id === 'order-review';
			return isActive;
		},
	};
}
