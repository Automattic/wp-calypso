/**
 * Internal dependencies
 */
import { CheckoutProvider, useEvents, useMessages } from './components/checkout-provider';
import CheckoutStep from './components/checkout-step';
import CheckoutPaymentMethods from './components/checkout-payment-methods';
import {
	OrderReviewLineItems,
	OrderReviewTotal,
	OrderReviewSection,
} from './components/order-review-line-items';
import Checkout from './components/checkout';
import CheckoutModal from './components/checkout-modal';
import { renderDisplayValueMarkdown } from './lib/render';
import { usePaymentMethod, usePaymentMethodId, useAllPaymentMethods } from './lib/payment-methods';
import { useLineItems, useTotal } from './lib/line-items';
import {
	createRegistry,
	useDispatch,
	usePaymentData,
	useRegisterStore,
	useRegistry,
	useSelect,
} from './lib/registry';
import { createFullCreditsMethod } from './lib/payment-methods/full-credits';
import { createFreePaymentMethod } from './lib/payment-methods/free-purchase';
import { createStripeMethod } from './lib/payment-methods/stripe-credit-card-fields';
import { createApplePayMethod } from './lib/payment-methods/apple-pay';
import { createPayPalMethod } from './lib/payment-methods/paypal';
import { createExistingCardMethod } from './lib/payment-methods/existing-credit-card';
import { useActiveStep, useIsStepActive, useIsStepComplete } from './lib/active-step';
import CheckoutOrderSummary, {
	CheckoutOrderSummaryTitle,
} from './components/checkout-order-summary';
import {
	getDefaultOrderSummaryStep,
	getDefaultPaymentMethodStep,
	getDefaultOrderReviewStep,
} from './components/default-steps';
import { useFormStatus } from './lib/form-status';

// Re-export the public API
export {
	Checkout,
	CheckoutModal,
	CheckoutOrderSummary,
	CheckoutOrderSummaryTitle,
	CheckoutPaymentMethods,
	CheckoutProvider,
	CheckoutStep,
	OrderReviewLineItems,
	OrderReviewSection,
	OrderReviewTotal,
	createApplePayMethod,
	createExistingCardMethod,
	createFreePaymentMethod,
	createFullCreditsMethod,
	createPayPalMethod,
	createRegistry,
	createStripeMethod,
	getDefaultOrderReviewStep,
	getDefaultOrderSummaryStep,
	getDefaultPaymentMethodStep,
	renderDisplayValueMarkdown,
	useActiveStep,
	useAllPaymentMethods,
	useDispatch,
	useEvents,
	useFormStatus,
	useIsStepActive,
	useIsStepComplete,
	useLineItems,
	useMessages,
	usePaymentData,
	usePaymentMethod,
	usePaymentMethodId,
	useRegisterStore,
	useRegistry,
	useSelect,
	useTotal,
};
