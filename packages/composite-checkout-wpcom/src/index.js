/**
 * Internal dependencies
 */
import WPCheckout from './components/wp-checkout';
import WPCheckoutErrorBoundary from './components/wp-checkout-error-boundary';
import { useShoppingCart } from './hooks/use-shopping-cart';
import { useWpcomStore } from './hooks/wpcom-store';
import { mockSetCartEndpoint, mockGetCartEndpointWith } from './mock/cart-endpoint';
import FormFieldAnnotation from './components/form-field-annotation';
import { getNonProductWPCOMCartItemTypes } from './lib/translate-cart';
import { areDomainsInLineItems } from './hooks/has-domains';
import {
	WPCOMCartItem,
	CheckoutCartItem,
	prepareDomainContactDetails,
	translateCheckoutPaymentMethodToWpcomPaymentMethod,
	domainManagedContactDetails,
	taxManagedContactDetails,
	isCompleteAndValid,
	areRequiredFieldsNotEmpty,
} from './types';

// Re-export the public API
export {
	WPCheckout,
	WPCheckoutErrorBoundary,
	useShoppingCart,
	useWpcomStore,
	mockSetCartEndpoint,
	mockGetCartEndpointWith,
	FormFieldAnnotation,
	WPCOMCartItem,
	CheckoutCartItem,
	prepareDomainContactDetails,
	getNonProductWPCOMCartItemTypes,
	translateCheckoutPaymentMethodToWpcomPaymentMethod,
	domainManagedContactDetails,
	taxManagedContactDetails,
	areDomainsInLineItems,
	isCompleteAndValid,
	areRequiredFieldsNotEmpty,
};
