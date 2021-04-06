/**
 * External dependencies
 */
import type { LineItem } from '@automattic/composite-checkout';
import type {
	RequestCartProduct,
	ResponseCartTaxData,
	DomainContactDetails,
} from '@automattic/shopping-cart';

export type WPCOMTransactionEndpointCart = {
	blog_id: string;
	cart_key: string;
	create_new_blog: boolean;
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
	firstName?: string;
	lastName?: string;
	organization?: string;
	email?: string;
	alternateEmail?: string;
	phone?: string;
	address1?: string;
	address2?: string;
	city?: string;
	state?: string;
	postalCode?: string;
	countryCode?: string;
	fax?: string;
	vatId?: string;
	extra?: DomainContactDetailsErrorsExtra;
};

type DomainContactDetailsErrorsExtra = {
	ca?: CaDomainContactExtraDetailsErrors | null;
	uk?: UkDomainContactExtraDetailsErrors | null;
	fr?: FrDomainContactExtraDetailsErrors | null;
};

export type CaDomainContactExtraDetailsErrors = {
	lang?: string;
	legalType?: string;
	ciraAgreementAccepted?: string;
};

export type UkDomainContactExtraDetailsErrors = {
	registrantType?: { errorCode: string; errorMessage: string }[];
	registrationNumber?: { errorCode: string; errorMessage: string }[];
	tradingName?: { errorCode: string; errorMessage: string }[];
};

export type FrDomainContactExtraDetailsErrors = {
	registrantType?: string[];
	registrantVatId?: string[];
	trademarkNumber?: string[];
	sirenSiret?: string[];
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

export type CheckoutPaymentMethodSlug =
	| 'alipay'
	| 'apple-pay'
	| 'bancontact'
	| 'card'
	| 'ebanx'
	| 'brazil-tef'
	| 'netbanking'
	| 'id_wallet'
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
	| 'wechat';

/**
 * Payment method slugs as returned by the WPCOM backend.
 * These need to be translated to the values expected by
 * composite-checkout.
 */
export type WPCOMPaymentMethod =
	| 'WPCOM_Billing_WPCOM'
	| 'WPCOM_Billing_Ebanx'
	| 'WPCOM_Billing_Ebanx_Redirect_Brazil_Tef'
	| 'WPCOM_Billing_Dlocal_Redirect_India_Netbanking'
	| 'WPCOM_Billing_Dlocal_Redirect_Indonesia_Wallet'
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

export type ManagedContactDetailsErrors = ManagedContactDetailsShape< undefined | string[] >;

/*
 * Intermediate type used to represent update payloads
 */
export type ManagedContactDetailsUpdate = ManagedContactDetailsShape< string >;

/*
 * Different subsets of the details are mandatory depending on what is
 * in the cart. This type lets us define these subsets declaratively.
 */
export type ManagedContactDetailsRequiredMask = ManagedContactDetailsShape< boolean >;

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
	errors: string[]; // Has value passed validation?
	isRequired: boolean; // Is this field required?
}

export type WpcomStoreState = {
	siteId: string;
	siteSlug: string;
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
	populateCountryCodeFromGeoIP: (
		arg0: ManagedContactDetails,
		arg1: string
	) => ManagedContactDetails;
	populateDomainFieldsFromCache: (
		arg0: ManagedContactDetails,
		arg1: PossiblyCompleteDomainContactDetails
	) => ManagedContactDetails;
};
