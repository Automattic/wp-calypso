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
import { useLineItems, useTotal } from './lib/line-items';
import { useLocalize } from './lib/localize';
import { createRegistry, useSelect, useDispatch } from './lib/registry';
import WPCheckoutOrderSummary from './components/wp-checkout-order-summary';
import WPCheckoutOrderReview from './components/wp-checkout-order-review';

// Re-export the public API
export {
	Checkout,
	createRegistry,
	CheckoutPaymentMethods,
	CheckoutProvider,
	CheckoutStep,
	OrderReviewLineItems,
	OrderReviewSection,
	OrderReviewTotal,
	renderDisplayValueMarkdown,
	useAllPaymentMethods,
	useCheckoutHandlers,
	useLineItems,
	useCheckoutRedirects,
	usePaymentMethod,
	usePaymentMethodId,
	useSelect,
	useDispatch,
	useLocalize,
	useTotal,
	WPCheckoutOrderSummary,
	WPCheckoutOrderReview,
};
