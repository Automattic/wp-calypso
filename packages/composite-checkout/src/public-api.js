/**
 * Internal dependencies
 */
import { CheckoutProvider, useEvents, useMessages } from './components/checkout-provider';
import {
	CheckoutSteps,
	Checkout,
	CheckoutStep,
	CheckoutStepBody,
	useIsStepActive,
	useIsStepComplete,
} from './components/checkout-steps';
import CheckoutPaymentMethods from './components/checkout-payment-methods';
import {
	OrderReviewLineItems,
	OrderReviewTotal,
	OrderReviewSection,
} from './components/order-review-line-items';
import CheckoutModal from './components/checkout-modal';
import { renderDisplayValueMarkdown } from './lib/render';
import { usePaymentMethod, usePaymentMethodId, useAllPaymentMethods } from './lib/payment-methods';
import { useLineItems, useTotal } from './lib/line-items';
import {
	createRegistry,
	defaultRegistry,
	registerStore,
	useDispatch,
	useRegisterStore,
	useRegistry,
	useSelect,
} from './lib/registry';
import { createFullCreditsMethod } from './lib/payment-methods/full-credits';
import { createFreePaymentMethod } from './lib/payment-methods/free-purchase';
import {
	createStripeMethod,
	createStripePaymentMethodStore,
} from './lib/payment-methods/stripe-credit-card-fields';
import { createApplePayMethod } from './lib/payment-methods/apple-pay';
import { createPayPalMethod } from './lib/payment-methods/paypal';
import { createExistingCardMethod } from './lib/payment-methods/existing-credit-card';
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
	CheckoutStepBody,
	CheckoutSteps,
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
	createStripePaymentMethodStore,
	defaultRegistry,
	getDefaultOrderReviewStep,
	getDefaultOrderSummaryStep,
	getDefaultPaymentMethodStep,
	registerStore,
	renderDisplayValueMarkdown,
	useAllPaymentMethods,
	useDispatch,
	useEvents,
	useFormStatus,
	useIsStepActive,
	useIsStepComplete,
	useLineItems,
	useMessages,
	usePaymentMethod,
	usePaymentMethodId,
	useRegisterStore,
	useRegistry,
	useSelect,
	useTotal,
};
