// Disabling duplicate imports while bugs in eslint-plugin-import TS 3.8 support remain.
// See https://github.com/benmosher/eslint-plugin-import/issues/1667
/* eslint-disable no-duplicate-imports */

/**
 * Internal dependencies
 */
import type { CheckoutPaymentMethodSlug } from './types/checkout-payment-method-slug';
import type { WPCOMPaymentMethodClass } from './types/backend/payment-method';
import {
	readWPCOMPaymentMethodClass,
	translateWpcomPaymentMethodToCheckoutPaymentMethod,
	translateCheckoutPaymentMethodToWpcomPaymentMethod,
} from './types/backend/payment-method';
import type {
	RequestCart,
	RequestCartProduct,
	ResponseCart,
	ResponseCartProduct,
	TempResponseCartProduct,
	CartLocation,
} from './types/backend/shopping-cart-endpoint';
import {
	emptyResponseCart,
	removeItemFromResponseCart,
	addItemToResponseCart,
	replaceItemInResponseCart,
	addCouponToResponseCart,
	removeCouponFromResponseCart,
	addLocationToResponseCart,
	doesCartLocationDifferFromResponseCartLocation,
	convertRawResponseCartToResponseCart,
	convertResponseCartToRequestCart,
} from './types/backend/shopping-cart-endpoint';
import type {
	DomainContactDetails,
	PossiblyCompleteDomainContactDetails,
	DomainContactDetailsErrors,
} from './types/backend/domain-contact-details-components';
import type {
	WPCOMCart,
	WPCOMCartItem,
	WPCOMCartCouponItem,
	CheckoutCartItem,
	CheckoutCartItemAmount,
} from './types/checkout-cart';
import { emptyWPCOMCart } from './types/checkout-cart';
import type {
	WpcomStoreState,
	ManagedContactDetails,
	ManagedContactDetailsErrors,
} from './types/wpcom-store-state';
import {
	getInitialWpcomStoreState,
	emptyManagedContactDetails,
	applyContactDetailsRequiredMask,
	domainRequiredContactDetails,
	taxRequiredContactDetails,
	isCompleteAndValid,
	isTouched,
	managedContactDetailsUpdaters,
	prepareDomainContactDetails,
	prepareDomainContactDetailsErrors,
	prepareDomainContactValidationRequest,
	formatDomainContactValidationResponse,
	isValid,
	areRequiredFieldsNotEmpty,
} from './types/wpcom-store-state';

export type {
	CheckoutPaymentMethodSlug,
	WPCOMPaymentMethodClass,
	RequestCart,
	RequestCartProduct,
	ResponseCart,
	ResponseCartProduct,
	TempResponseCartProduct,
	CartLocation,
	WPCOMCart,
	WPCOMCartItem,
	WPCOMCartCouponItem,
	CheckoutCartItem,
	CheckoutCartItemAmount,
	WpcomStoreState,
	ManagedContactDetails,
	ManagedContactDetailsErrors,
	DomainContactDetails,
	PossiblyCompleteDomainContactDetails,
	DomainContactDetailsErrors,
};

export {
	readWPCOMPaymentMethodClass,
	translateWpcomPaymentMethodToCheckoutPaymentMethod,
	translateCheckoutPaymentMethodToWpcomPaymentMethod,
	emptyResponseCart,
	convertResponseCartToRequestCart,
	removeItemFromResponseCart,
	addItemToResponseCart,
	replaceItemInResponseCart,
	addCouponToResponseCart,
	removeCouponFromResponseCart,
	addLocationToResponseCart,
	doesCartLocationDifferFromResponseCartLocation,
	convertRawResponseCartToResponseCart,
	emptyWPCOMCart,
	getInitialWpcomStoreState,
	emptyManagedContactDetails,
	applyContactDetailsRequiredMask,
	domainRequiredContactDetails,
	taxRequiredContactDetails,
	isCompleteAndValid,
	isTouched,
	managedContactDetailsUpdaters,
	prepareDomainContactDetails,
	prepareDomainContactDetailsErrors,
	prepareDomainContactValidationRequest,
	formatDomainContactValidationResponse,
	isValid,
	areRequiredFieldsNotEmpty,
};

/* eslint-enable no-duplicate-imports */
