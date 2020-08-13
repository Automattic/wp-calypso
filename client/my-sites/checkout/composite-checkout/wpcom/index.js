/**
 * Internal dependencies
 */
import WPCheckout from './components/wp-checkout';
import { useWpcomStore } from './hooks/wpcom-store';
import FormFieldAnnotation from './components/form-field-annotation';
import { getNonProductWPCOMCartItemTypes } from './lib/translate-cart';
import { areDomainsInLineItems } from './hooks/has-domains';
import {
	prepareDomainContactDetails,
	translateCheckoutPaymentMethodToWpcomPaymentMethod,
	translateCheckoutPaymentMethodToTracksPaymentMethod,
	emptyManagedContactDetails,
	applyContactDetailsRequiredMask,
	domainRequiredContactDetails,
	taxRequiredContactDetails,
	prepareDomainContactValidationRequest,
	prepareGSuiteContactValidationRequest,
	formatDomainContactValidationResponse,
	getSignupValidationErrorResponse,
	isCompleteAndValid,
	areRequiredFieldsNotEmpty,
} from './types';

// Re-export the public API
export {
	WPCheckout,
	useWpcomStore,
	FormFieldAnnotation,
	prepareDomainContactDetails,
	getNonProductWPCOMCartItemTypes,
	translateCheckoutPaymentMethodToWpcomPaymentMethod,
	translateCheckoutPaymentMethodToTracksPaymentMethod,
	emptyManagedContactDetails,
	applyContactDetailsRequiredMask,
	domainRequiredContactDetails,
	taxRequiredContactDetails,
	prepareDomainContactValidationRequest,
	prepareGSuiteContactValidationRequest,
	formatDomainContactValidationResponse,
	getSignupValidationErrorResponse,
	areDomainsInLineItems,
	isCompleteAndValid,
	areRequiredFieldsNotEmpty,
};
