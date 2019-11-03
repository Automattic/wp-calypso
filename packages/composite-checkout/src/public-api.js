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
import { useLineItems } from './lib/line-items';
import { useLocalize } from './lib/localize';
import {
	createRegistry,
	useSelect,
	useDispatch,
	registerStore,
	subscribe,
	dispatch,
	select,
} from './lib/registry';

// Re-export the public API
export {
	createRegistry,
	Checkout,
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
	registerStore,
	subscribe,
	dispatch,
	select,
	useLocalize,
};
