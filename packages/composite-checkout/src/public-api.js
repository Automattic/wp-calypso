/**
 * Internal dependencies
 */
import { CheckoutProvider, useEvents, useMessages } from './components/checkout-provider';
import {
	Checkout,
	CheckoutStep,
	CheckoutStepArea,
	CheckoutStepBody,
	CheckoutSteps,
	CheckoutSummaryArea,
	CheckoutSummaryCard,
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
import { useLineItems, useTotal, useLineItemsOfType } from './lib/line-items';
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
import CheckoutOrderSummaryStep, {
	CheckoutOrderSummary,
	CheckoutOrderSummaryStepTitle,
} from './components/checkout-order-summary';
import {
	getDefaultOrderSummary,
	getDefaultOrderSummaryStep,
	getDefaultPaymentMethodStep,
	getDefaultOrderReviewStep,
} from './components/default-steps';
import { useFormStatus } from './lib/form-status';
import { CheckIcon as CheckoutCheckIcon } from './components/shared-icons';

// Re-export the public API
export {
	Checkout,
	CheckoutCheckIcon,
	CheckoutModal,
	CheckoutOrderSummaryStep,
	CheckoutOrderSummary,
	CheckoutOrderSummaryStepTitle,
	CheckoutPaymentMethods,
	CheckoutProvider,
	CheckoutStep,
	CheckoutStepArea,
	CheckoutStepBody,
	CheckoutSteps,
	CheckoutSummaryArea,
	CheckoutSummaryCard,
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
	getDefaultOrderSummary,
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
	useLineItemsOfType,
	useTotal,
};
