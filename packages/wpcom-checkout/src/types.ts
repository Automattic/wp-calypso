import type { LineItem } from '@automattic/composite-checkout';
import type {
	RequestCartProduct,
	ResponseCartTaxData,
	DomainContactDetails,
} from '@automattic/shopping-cart';
import type { TranslateResult } from 'i18n-calypso';

export type WPCOMTransactionEndpointCart = {
	blog_id: string;
	cart_key: string;
	create_new_blog: boolean;
	is_jetpack_checkout?: boolean;
	jetpack_blog_id?: string;
	coupon: string;
	currency: string;
	temporary: false;
	extra: string[];
	products: RequestCartProduct[];
	tax: Omit< ResponseCartTaxData, 'display_taxes' >;
};

type PurchaseSiteId = number;

export type WPCOMTransactionEndpointResponse = {
	success: boolean;
	error_code: string;
	error_message: string;
	failed_purchases?: Record< PurchaseSiteId, Purchase[] >;
	purchases?: Record< PurchaseSiteId, Purchase[] >;
	receipt_id?: number;
	order_id?: number;
	redirect_url?: string;
	message?: { payment_intent_client_secret: string };
};

export interface Purchase {
	meta: string;
	product_id: string | number;
	product_slug: string;
	product_cost: string | number;
	product_name: string;
	product_name_short: string;
	delayed_provisioning?: boolean;
	is_domain_registration?: boolean;
	registrar_support_url?: string;
	is_email_verified?: boolean;
	is_root_domain_with_us?: boolean;
	will_auto_renew?: boolean;
	expiry: string;
	user_email: string;
}

export interface TransactionRequest {
	country: string;
	postalCode: string;
	cart: WPCOMTransactionEndpointCart;
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
	tefBank?: string | undefined;
	pan?: string | undefined;
	gstin?: string | undefined;
	nik?: string | undefined;
	useForAllSubscriptions?: boolean;
	eventSource?: string;
}

export type WPCOMTransactionEndpoint = (
	_: WPCOMTransactionEndpointRequestPayload
) => Promise< WPCOMTransactionEndpointResponse >;

// Request payload as expected by the WPCOM transactions endpoint
// '/me/transactions/': WPCOM_JSON_API_Transactions_Endpoint
export type WPCOMTransactionEndpointRequestPayload = {
	cart: WPCOMTransactionEndpointCart;
	payment: WPCOMTransactionEndpointPaymentDetails;
	domainDetails?: DomainContactDetails;
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
	deviceId?: string;
	successUrl?: string;
	cancelUrl?: string;
	idealBank?: string;
	tefBank?: string;
	pan?: string;
	gstin?: string;
	nik?: string;
	useForAllSubscriptions?: boolean;
	eventSource?: string;
};

// The data model used in ContactDetailsFormFields and related components.
// This is the data returned by the redux state, where the fields could have a
// null value.
export type PossiblyCompleteDomainContactDetails = {
	firstName: string | null;
	lastName: string | null;
	organization: string | null;
	email: string | null;
	alternateEmail: string | null;
	phone: string | null;
	address1: string | null;
	address2: string | null;
	city: string | null;
	state: string | null;
	postalCode: string | null;
	countryCode: string | null;
	fax: string | null;
};

export type DomainContactDetailsErrors = {
	firstName?: string | TranslateResult;
	lastName?: string | TranslateResult;
	organization?: string | TranslateResult;
	email?: string | TranslateResult;
	alternateEmail?: string | TranslateResult;
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

export type PayPalExpressEndpoint = (
	_: PayPalExpressEndpointRequestPayload
) => Promise< PayPalExpressEndpointResponse >;

export type PayPalExpressEndpointRequestPayload = {
	successUrl: string;
	cancelUrl: string;
	cart: WPCOMTransactionEndpointCart;
	domainDetails: DomainContactDetails | null;
	country: string;
	postalCode: string;
};

export type PayPalExpressEndpointResponse = unknown;

export interface WPCOMCart {
	items: LineItem[];
	total: LineItem;
	allowedPaymentMethods: CheckoutPaymentMethodSlug[];
}

// Payment method slugs which all map to a WPCOMPaymentMethod using
// translateCheckoutPaymentMethodToWpcomPaymentMethod and
// translateWpcomPaymentMethodToCheckoutPaymentMethod.
export type CheckoutPaymentMethodSlug =
	| 'alipay'
	| 'web-pay'
	| 'bancontact'
	| 'card'
	| 'ebanx'
	| 'brazil-tef'
	| 'netbanking'
	| 'eps'
	| 'giropay'
	| 'ideal'
	| 'p24'
	| 'paypal'
	| 'paypal-direct'
	| 'sofort'
	| 'free-purchase'
	| 'full-credits'
	| 'stripe-three-d-secure'
	| 'wechat'
	| `existingCard${ string }`
	| 'stripe' // a synonym for 'card'
	| 'apple-pay' // a synonym for 'web-pay'
	| 'google-pay'; // a synonym for 'web-pay'

/**
 * Payment method slugs as returned by the WPCOM backend.
 * These need to be translated to the values expected by
 * composite-checkout.
 */
export type WPCOMPaymentMethod =
	| 'WPCOM_Billing_WPCOM'
	| 'WPCOM_Billing_MoneyPress_Stored'
	| 'WPCOM_Billing_Ebanx'
	| 'WPCOM_Billing_Ebanx_Redirect_Brazil_Tef'
	| 'WPCOM_Billing_Dlocal_Redirect_India_Netbanking'
	| 'WPCOM_Billing_PayPal_Direct'
	| 'WPCOM_Billing_PayPal_Express'
	| 'WPCOM_Billing_Stripe_Payment_Method'
	| 'WPCOM_Billing_Stripe_Source_Alipay'
	| 'WPCOM_Billing_Stripe_Source_Bancontact'
	| 'WPCOM_Billing_Stripe_Source_Eps'
	| 'WPCOM_Billing_Stripe_Source_Giropay'
	| 'WPCOM_Billing_Stripe_Source_Ideal'
	| 'WPCOM_Billing_Stripe_Source_P24'
	| 'WPCOM_Billing_Stripe_Source_Sofort'
	| 'WPCOM_Billing_Stripe_Source_Three_D_Secure'
	| 'WPCOM_Billing_Stripe_Source_Wechat'
	| 'WPCOM_Billing_Web_Payment';

export type ContactDetailsType = 'gsuite' | 'tax' | 'domain' | 'none';

export type ManagedContactDetailsShape< T > = {
	firstName?: T;
	lastName?: T;
	organization?: T;
	email?: T;
	alternateEmail?: T;
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
		trademarkNumber?: T;
		sirenSiret?: T;
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
};

export interface FailedPurchase {
	product_meta: string;
	product_id: string | number;
	product_slug: string;
	product_cost: string | number;
	product_name: string;
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

/**
 * Request parameter expected by the domain contact validation endpoint.
 *
 * @see WPCOM_JSON_API_Signups_Validation_User_Endpoint
 */
export type SignupValidationResponse = {
	success: boolean;
	messages?: {
		first_name?: string[];
		last_name?: string[];
		email?: Record< string, string >;
		username?: string[];
		password?: string[];
	};
};

/**
 * Request parameter expected by the domain contact validation endpoint.
 *
 * @see WPCOM_JSON_API_Domains_Validate_Contact_Information_Endpoint
 */
export type ContactValidationRequestContactInformation = {
	first_name?: string;
	last_name?: string;
	organization?: string;
	email?: string;
	alternate_email?: string;
	phone?: string;
	phone_number_country?: string;
	address_1?: string;
	address_2?: string;
	city?: string;
	state?: string;
	postal_code?: string;
	country_code?: string;
	fax?: string;
	vat_id?: string;
	extra?: DomainContactValidationRequestExtraFields;
};

export type DomainContactValidationRequest = {
	contact_information: ContactValidationRequestContactInformation;
};

export type GSuiteContactValidationRequest = {
	contact_information: {
		first_name: string;
		last_name: string;
		alternate_email: string;
		postal_code: string;
		country_code: string;
	};
};

export type DomainContactValidationRequestExtraFields = {
	ca?: {
		lang?: string;
		legal_type?: string;
		cira_agreement_accepted?: boolean;
	};
	uk?: {
		registrant_type?: string;
		registration_number?: string;
		trading_name?: string;
	};
	fr?: {
		registrant_type?: string;
		registrant_vat_id?: string;
		trademark_number?: string;
		siren_siret?: string;
	};
};

export type ContactValidationResponseMessagesExtra = {
	ca?: {
		lang?: string[];
		legal_type?: string[];
		cira_agreement_accepted?: string[];
	};
	uk?: {
		registrant_type?: string[];
		registration_number?: string[];
		trading_name?: string[];
	};
	fr?: {
		registrant_type?: string[];
		trademark_number?: string[];
		siren_siret?: string[];
	};
};

/**
 * Response format of the domain contact validation endpoint.
 */
export type ContactValidationResponseMessages = {
	first_name?: string[];
	last_name?: string[];
	organization?: string[];
	email?: string[];
	alternate_email?: string[];
	phone?: string[];
	phone_number_country?: string[];
	address_1?: string[];
	address_2?: string[];
	city?: string[];
	state?: string[];
	postal_code?: string[];
	country_code?: string[];
	fax?: string[];
	vat_id?: string[];
	extra?: ContactValidationResponseMessagesExtra;
};

export type RawContactValidationResponseMessages = Record< string, string[] >;

export type DomainContactValidationResponse =
	| { success: true }
	| {
			success: false;
			messages: ContactValidationResponseMessages;
			messages_flat: string[];
	  };

export type RawDomainContactValidationResponse =
	| { success: true }
	| {
			success: false;
			messages: RawContactValidationResponseMessages;
			messages_flat: string[];
	  };

export interface CountryListItem {
	code: string;
	name: string;
	has_postal_codes: boolean;
}
