import type { WPCOMTransactionEndpointResponse } from '@automattic/api-core';
import type { DomainContactDetails, RequestCart } from '@automattic/shopping-cart';
import type { TranslateResult } from 'i18n-calypso';
export type { SitelessCheckoutType } from '@automattic/shopping-cart';

export type {
	FailedPurchase,
	TaxVendorInfo,
	TransactionResponsePurchase,
	WPCOMTransactionEndpointResponse,
	WPCOMTransactionEndpointResponseFailed,
	WPCOMTransactionEndpointResponsePayPal,
	WPCOMTransactionEndpointResponseRedirect,
	WPCOMTransactionEndpointResponseSuccess,
} from '@automattic/api-core';

export interface TaxBreakdownEntry {
	label: string;
	rate: number;
	rate_display: string;
	local_tax_collected: number;
	local_tax_collected_integer: number;
}

export interface TransactionRequest {
	country: string;
	postalCode: string;
	cart: RequestCart;
	paymentMethodType: string;
	name: string;
	siteId?: string | undefined;
	couponId?: string | undefined;
	state?: string | undefined;
	subdivisionCode?: string | undefined;
	city?: string | undefined;
	address?: string | undefined;
	streetNumber?: string | undefined;
	phoneNumber?: string | undefined;
	document?: string | undefined;
	deviceId?: string | undefined;
	domainDetails?: DomainContactDetails | undefined;
	paymentMethodToken?: string | undefined;
	paymentPartnerProcessorId?: string | undefined;
	storedDetailsId?: string | undefined;
	email?: string | undefined;
	successUrl?: string | undefined;
	cancelUrl?: string | undefined;
	idealBank?: string | undefined;
	// 6-digit BLIK code generated in the customer's banking app.
	code?: string | undefined;
	useForAllSubscriptions?: boolean;
	eventSource?: string;
}

export type WPCOMTransactionEndpoint = (
	_: WPCOMTransactionEndpointRequestPayload
) => Promise< WPCOMTransactionEndpointResponse >;

// Request payload as expected by the WPCOM transactions endpoint
// '/me/transactions/': WPCOM_JSON_API_Transactions_Endpoint
export type WPCOMTransactionEndpointRequestPayload = {
	cart: RequestCart;
	payment: WPCOMTransactionEndpointPaymentDetails;
	domainDetails?: DomainContactDetails;
	tos?: ToSAcceptanceTrackingDetails;
	ad_conversion?: AdConversionDetails;
};

export type ToSAcceptanceTrackingDetails = {
	path: string;
	locale: string;
	viewport: string;
};

export type AdConversionDetails = {
	ad_details: string;
	sensitive_pixel_options: string; // sensitive_pixel_options
};

export type WPCOMTransactionEndpointPaymentDetails = {
	paymentMethod: string;
	paymentKey?: string;
	paymentPartner?: string;
	storedDetailsId?: string;
	name: string;
	email?: string;
	zip: string;
	postalCode: string;
	country: string;
	countryCode: string;
	state?: string;
	city?: string;
	address?: string;
	streetNumber?: string;
	phoneNumber?: string;
	document?: string;
	isForBusiness?: boolean;
	deviceId?: string;
	successUrl?: string;
	cancelUrl?: string;
	idealBank?: string;
	// 6-digit BLIK code generated in the customer's banking app.
	code?: string;
	useForAllSubscriptions?: boolean;
	eventSource?: string;
};

/**
 * The data model used in ContactDetailsFormFields and related components.
 */
export type PossiblyCompleteDomainContactDetails = {
	firstName: string | null;
	lastName: string | null;
	organization: string | null;
	email: string | null;
	phone: string | null;
	address1: string | null;
	address2: string | null;
	city: string | null;
	state: string | null;
	postalCode: string | null;
	countryCode: string | null;
	fax: string | null;
	extra?: ManagedContactDetailsTldExtraFieldsShape< string | null >;
};

export type DomainContactDetailsErrors = {
	firstName?: string | TranslateResult;
	lastName?: string | TranslateResult;
	organization?: string | TranslateResult;
	email?: string | TranslateResult;
	phone?: string | TranslateResult;
	address1?: string | TranslateResult;
	address2?: string | TranslateResult;
	city?: string | TranslateResult;
	state?: string | TranslateResult;
	postalCode?: string | TranslateResult;
	countryCode?: string | TranslateResult;
	fax?: string | TranslateResult;
	vatId?: string | TranslateResult;
	extra?: DomainContactDetailsErrorsExtra;
};

type DomainContactDetailsErrorsExtra = {
	ca?: CaDomainContactExtraDetailsErrors | null;
	uk?: UkDomainContactExtraDetailsErrors | null;
	fr?: FrDomainContactExtraDetailsErrors | null;
	in?: InDomainContactExtraDetailsErrors | null;
	es?: EsDomainContactExtraDetailsErrors | null;
};

export type CaDomainContactExtraDetailsErrors = {
	lang?: string | TranslateResult;
	legalType?: string | TranslateResult;
	ciraAgreementAccepted?: string | TranslateResult;
};

export type UkDomainContactExtraDetailsErrors = {
	registrantType?: { errorCode: string; errorMessage: string | TranslateResult }[];
	registrationNumber?: { errorCode: string; errorMessage: string | TranslateResult }[];
	tradingName?: { errorCode: string; errorMessage: string | TranslateResult }[];
};

export type FrDomainContactExtraDetailsErrors = {
	registrantType?: string[] | TranslateResult[];
	registrantVatId?: string[] | TranslateResult[];
	trademarkNumber?: string[] | TranslateResult[];
	sirenSiret?: string[] | TranslateResult[];
};

export type InDomainContactExtraDetailsErrors = {
	nexusDeclaration?: string | TranslateResult;
	nexusConnectionType?: string | TranslateResult;
};

export type EsDomainContactExtraDetailsErrors = {
	registrantEntityType?: string | TranslateResult;
	registrantIdentificationNumber?: string | TranslateResult;
	adminIdentificationNumber?: string | TranslateResult;
	redEsAgreementAccepted?: string | TranslateResult;
	redEsAgreementVersion?: string | TranslateResult;
};

export type PayPalExpressEndpoint = (
	_: PayPalExpressEndpointRequestPayload
) => Promise< PayPalExpressEndpointResponse >;

export type PayPalExpressEndpointRequestPayload = {
	successUrl: string;
	cancelUrl: string;
	cart: RequestCart;
	domainDetails: DomainContactDetails | null;
	country: string;
	postalCode: string;
	tos?: ToSAcceptanceTrackingDetails;
	ad_conversion?: AdConversionDetails;
};

export type PayPalExpressEndpointResponse = unknown;

export interface LineItemType {
	id: string;
	type: string;
	label: string;
	labelSuffix?: string;
	formattedAmount: string;
	hasDeleteButton?: boolean;
}

export interface WPCOMCart {
	allowedPaymentMethods: CheckoutPaymentMethodSlug[];
}

// Payment method slugs which all map to a WPCOMPaymentMethod using
// translateCheckoutPaymentMethodToWpcomPaymentMethod and
// translateWpcomPaymentMethodToCheckoutPaymentMethod.
export type CheckoutPaymentMethodSlug =
	| 'pix'
	| 'pix_automatico'
	| 'alipay'
	| 'web-pay'
	| 'bancontact'
	| 'card'
	| 'ebanx'
	| 'eps'
	| 'ideal'
	| 'p24'
	// NOTE: we cannot use the key `paypal` because composite-checkout
	// ends up using this as an `id`, which overwrites `window.paypal`
	// which is the namespace used by the PayPal JS SDK.
	| 'paypal-js'
	| 'paypal-express'
	| 'paypal-direct'
	| 'sofort'
	| 'free-purchase'
	| 'stripe-three-d-secure'
	| 'wechat'
	| 'existingCard'
	| `existingCard${ string }` // specific saved cards have unique slugs
	| 'existingPayPalPPCP'
	| `existingPayPalPPCP${ string }` // specific saved PayPal PPCP payment methods have unique slugs
	| 'stripe' // a synonym for 'card'
	| 'apple-pay' // a synonym for 'web-pay'
	| 'google-pay' // a synonym for 'web-pay'
	| 'stripe-upi'
	| 'stripe-blik';

/**
 * Payment method slugs as returned by the WPCOM backend.
 * These need to be translated to the values expected by
 * composite-checkout.
 */
export type WPCOMPaymentMethod =
	| 'WPCOM_Billing_WPCOM'
	| 'WPCOM_Billing_MoneyPress_Stored'
	| 'WPCOM_Billing_Ebanx'
	| 'WPCOM_Billing_PayPal_Direct'
	| 'WPCOM_Billing_PayPal_Express'
	| 'WPCOM_Billing_PayPal_PPCP'
	| 'WPCOM_Billing_Stripe_Payment_Method'
	| 'WPCOM_Billing_Stripe_Alipay'
	| 'WPCOM_Billing_Stripe_Bancontact'
	| 'WPCOM_Billing_Stripe_Eps'
	| 'WPCOM_Billing_Stripe_Ideal'
	| 'WPCOM_Billing_Stripe_P24'
	| 'WPCOM_Billing_Stripe_Wechat_Pay'
	| 'WPCOM_Billing_Web_Payment'
	| 'WPCOM_Billing_Ebanx_Redirect_Brazil_Pix'
	| 'WPCOM_Billing_Ebanx_Redirect_Brazil_Pix_Automatico'
	| 'WPCOM_Billing_Stripe_Upi'
	| 'WPCOM_Billing_Stripe_Blik';

export type ContactDetailsType = 'gsuite' | 'tax' | 'domain' | 'none';

export type ManagedContactDetailsShape< T > = {
	firstName?: T;
	lastName?: T;
	organization?: T;
	email?: T;
	phone?: T;
	phoneNumberCountry?: T;
	address1?: T;
	address2?: T;
	city?: T;
	state?: T;
	postalCode?: T;
	countryCode?: T;
	fax?: T;
	vatId?: T;
	tldExtraFields?: ManagedContactDetailsTldExtraFieldsShape< T >;
};

export type ManagedContactDetailsTldExtraFieldsShape< T > = {
	ca?: {
		lang?: T;
		legalType?: T;
		ciraAgreementAccepted?: T;
	};
	uk?: {
		registrantType?: T;
		registrationNumber?: T;
		tradingName?: T;
	};
	fr?: {
		registrantType?: T;
		registrantVatId?: T;
		trademarkNumber?: T;
		sirenSiret?: T;
	};
	in?: {
		nexusDeclaration?: T;
		nexusConnectionType?: T;
	};
	es?: {
		registrantEntityType?: T;
		registrantIdentificationNumber?: T;
		adminIdentificationNumber?: T;
		redEsAgreementAccepted?: T;
		redEsAgreementVersion?: T;
	};
};

/*
 * The wpcom store hook stores an object with all the contact info
 * which is used to share state across fields where appropriate.
 * Each value keeps track of whether it has been edited and validated.
 */
export type ManagedContactDetails = ManagedContactDetailsShape< ManagedValue >;

export type ManagedContactDetailsErrors = ManagedContactDetailsShape<
	undefined | string[] | TranslateResult[]
>;

/*
 * Intermediate type used to represent update payloads
 */
export type ManagedContactDetailsUpdate = ManagedContactDetailsShape< string >;

/*
 * All child components in composite checkout are controlled -- they accept
 * data from their parents and evaluate callbacks when edited, rather than
 * managing their own state. Hooks providing this data in turn need some extra
 * data on each field: specifically whether it has been edited by the user
 * or passed validation. We wrap this extra data into an object type.
 */
export interface ManagedValue {
	value: string;
	isTouched: boolean; // Has value been edited by the user?
	errors: string[] | TranslateResult[]; // Has value passed validation?
}

export type WpcomStoreState = {
	recaptchaClientId: number;
	transactionResult?: WPCOMTransactionEndpointResponse | undefined;
	contactDetails: ManagedContactDetails;
	vatDetails: VatDetails;
};

export interface VatDetails {
	country?: string | null;
	id?: string | null;
	name?: string | null;
	address?: string | null;
	isForBusiness?: boolean | null;
	can_user_edit?: boolean | false;
}

/*
 * Helper type which bundles the field updaters in a single object
 * to help keep import lists under control. All updaters should
 * assume input came from the user.
 */
export type ManagedContactDetailsUpdaters = {
	updatePhone: ( arg0: ManagedContactDetails, arg1: string ) => ManagedContactDetails;
	updatePhoneNumberCountry: ( arg0: ManagedContactDetails, arg1: string ) => ManagedContactDetails;
	updatePostalCode: ( arg0: ManagedContactDetails, arg1: string ) => ManagedContactDetails;
	updateEmail: ( arg0: ManagedContactDetails, arg1: string ) => ManagedContactDetails;
	updateCountryCode: ( arg0: ManagedContactDetails, arg1: string ) => ManagedContactDetails;
	updateTaxFields: (
		arg0: ManagedContactDetails,
		arg1: ManagedContactDetails
	) => ManagedContactDetails;
	updateDomainContactFields: (
		arg0: ManagedContactDetails,
		arg1: DomainContactDetails
	) => ManagedContactDetails;
	touchContactFields: ( arg0: ManagedContactDetails ) => ManagedContactDetails;
	updateVatId: ( arg0: ManagedContactDetails, arg1: string ) => ManagedContactDetails;
	setErrorMessages: (
		arg0: ManagedContactDetails,
		arg1: ManagedContactDetailsErrors
	) => ManagedContactDetails;
	clearErrorMessages: ( arg0: ManagedContactDetails ) => ManagedContactDetails;
	populateCountryCodeFromGeoIP: (
		arg0: ManagedContactDetails,
		arg1: string
	) => ManagedContactDetails;
	populateDomainFieldsFromCache: (
		arg0: ManagedContactDetails,
		arg1: PossiblyCompleteDomainContactDetails
	) => ManagedContactDetails;
};

export type GSuiteContactValidationRequest = {
	contact_information: {
		country_code: string;
		email: string;
		first_name: string;
		last_name: string;
		postal_code: string;
		address_1?: string;
		address_2?: string;
		city?: string;
		fax?: string;
		organization?: string;
		phone?: string;
		phone_number_country?: string;
		state?: string;
		vat_id?: string;
	};
};

export type {
	ContactValidationRequestContactInformation,
	ContactValidationResponseMessages,
	ContactValidationResponseMessagesExtra,
	DomainContactValidationRequest,
	DomainContactValidationRequestExtraFields,
	DomainContactValidationResponse,
	RawCachedDomainContactDetails,
	RawContactValidationResponseMessages,
	RawDomainContactValidationResponse,
	SignupValidationResponse,
} from '@automattic/api-core';

export type {
	CountryListItemBase,
	CountryListItemWithoutVat,
	CountryListItemWithVat,
	CountryListItem,
} from '@automattic/api-core';

/**
 * Copied these types from Redux to avoid needing to import the whole package.
 */
type ReduxAction< T extends string = string > = {
	type: T;
};
export interface AnyAction extends ReduxAction {
	[ extraProps: string ]: any;
}
