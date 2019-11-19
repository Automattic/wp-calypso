/**
 * Internal dependencies
 */
import {
	CheckoutProvider,
	useCheckoutHandlers,
	useCheckoutRedirects,
} from './components/checkout-provider';
import CheckoutStep from './components/checkout-step';
import CheckoutPaymentMethods from './components/checkout-payment-methods';
import {
	OrderReviewLineItems,
	OrderReviewTotal,
	OrderReviewSection,
} from './components/order-review-line-items';
import Checkout from './components/checkout';
import { renderDisplayValueMarkdown } from './lib/render';
import { usePaymentMethod, usePaymentMethodId, useAllPaymentMethods } from './lib/payment-methods';
import { useLineItems, useTotal, useHasDomainsInCart } from './lib/line-items';
import {
	createRegistry,
	useDispatch,
	usePaymentData,
	usePrimaryDispatch,
	usePrimarySelect,
	useRegisterStore,
	useRegistry,
	useSelect,
} from './lib/registry';
import {
	WPCheckoutOrderSummary,
	WPCheckoutOrderSummaryTitle,
	WPCheckoutOrderReview,
	WPContactForm,
} from './wpcom/index'; // TODO: remove this
import { createStripeMethod } from './lib/payment-methods/stripe-credit-card-fields';
import { createApplePayMethod } from './lib/payment-methods/apple-pay';
import { createPayPalMethod } from './lib/payment-methods/paypal';
import { createCreditCardMethod } from './lib/payment-methods/credit-card';
import { useActiveStep } from './lib/active-step';
import CheckoutOrderSummary, {
	CheckoutOrderSummaryTitle,
} from './components/checkout-order-summary';

// Re-export the public API
export {
	Checkout,
	CheckoutOrderSummary,
	CheckoutOrderSummaryTitle,
	CheckoutPaymentMethods,
	CheckoutProvider,
	CheckoutStep,
	OrderReviewLineItems,
	OrderReviewSection,
	OrderReviewTotal,
	WPCheckoutOrderReview,
	WPCheckoutOrderSummary,
	WPCheckoutOrderSummaryTitle,
	WPContactForm,
	createApplePayMethod,
	createCreditCardMethod,
	createPayPalMethod,
	createRegistry,
	createStripeMethod,
	renderDisplayValueMarkdown,
	useActiveStep,
	useAllPaymentMethods,
	useCheckoutHandlers,
	useCheckoutRedirects,
	useDispatch,
	useHasDomainsInCart,
	useLineItems,
	usePaymentData,
	usePaymentMethod,
	usePaymentMethodId,
	usePrimaryDispatch,
	usePrimarySelect,
	useRegisterStore,
	useRegistry,
	useSelect,
	useTotal,
};
