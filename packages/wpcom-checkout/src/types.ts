import type { DomainContactDetails, RequestCart } from '@automattic/shopping-cart';
import type { TranslateResult } from 'i18n-calypso';

type PurchaseSiteId = number;

export type WPCOMTransactionEndpointResponseSuccess = {
	success: true;
	purchases: Record< PurchaseSiteId, Purchase[] >;
	failed_purchases: Record< PurchaseSiteId, FailedPurchase[] >;
	receipt_id: number;
	order_id: number | '';
	redirect_url?: string;
	qr_code?: string;
	is_gift_purchase: boolean;
	display_price: string;
	price_integer: number;
	price_float: number;
	currency: string;
	is_gravatar_domain: boolean;
};

export type WPCOMTransactionEndpointResponseFailed = {
	success: false;
	purchases: Record< PurchaseSiteId, Purchase[] >;
	failed_purchases: Record< PurchaseSiteId, FailedPurchase[] >;
	receipt_id: number;
	order_id: number | '';
	redirect_url?: string;
	qr_code?: string;
	is_gift_purchase: boolean;
	display_price: string;
	price_integer: number;
	price_float: number;
	currency: string;
	is_gravatar_domain: boolean;
};

export type WPCOMTransactionEndpointResponseRedirect = {
	message: { payment_intent_client_secret: string } | '';
	order_id: number | '';
	redirect_url: string;
	qr_code?: string;
	razorpay_order_id?: string;
	razorpay_customer_id?: string;
	razorpay_option_recurring?: boolean;
};

export type WPCOMTransactionEndpointResponse =
	| WPCOMTransactionEndpointResponseSuccess
	| WPCOMTransactionEndpointResponseFailed
	| WPCOMTransactionEndpointResponseRedirect;

export interface TaxVendorInfo {
	/**
	 * The country code for this info.
	 */
	country_code: string;

	/**
	 * The mailing address to display on receipts as a list of strings (each
	 * string should be on its own line).
	 */
	address: string[];

	/**
	 * An object containing tax names and corresponding vendor ids that are used for the user's country
	 *
	 * This will deprecate the vat_id and tax_name properties
	 * For now, those two properties will stay in place for backwards compatibility
	 *
	 * Key:   The localized name of the tax (eg: "VAT", "GST", etc.).
	 * Value: A8c vendor id for that specific tax
	 */
	tax_name_and_vendor_id_array: Record< string, string >;

	/**
	 * The vendor's VAT id.
	 * @deprecated This is still in place for backwards compability with cached clients
	 */
	vat_id: string;

	/**
	 * The localized name of the tax (eg: "VAT", "GST", etc.).
	 * @deprecated This is still in place for backwards compability with cached clients
	 */
	tax_name: string;
}

export interface Purchase {
	delayed_provisioning?: boolean;
	expiry?: string;
	is_domain_registration: boolean;
	is_email_verified?: boolean;
	is_renewal: boolean;
	is_root_domain_with_us?: boolean;
	meta: string | null;
	new_quantity?: number;
	product_id: string | number;
	product_name: string;
	product_name_short: string;
	product_type: string;
	product_slug: string;
	registrar_support_url?: string;
	user_email: string;
	saas_redirect_url?: string;
	will_auto_renew?: boolean;
	tax_vendor_info?: TaxVendorInfo;
	blog_id: number;
	price_integer?: number;
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
	pan?: string;
	gstin?: string;
	nik?: string;
	useForAllSubscriptions?: boolean;
	eventSource?: string;
};

/**
 * The data returned by the /me/domain-contact-information endpoint
 */
export interface RawCachedDomainContactDetails {
	first_name?: string;
	last_name?: string;
	organization?: string;
	email?: string;
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
}

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
	| 'alipay'
	| 'web-pay'
	| 'bancontact'
	| 'card'
	| 'ebanx'
	| 'netbanking'
	| 'eps'
	| 'ideal'
	| 'p24'
	| 'paypal'
	| 'paypal-direct'
	| 'sofort'
	| 'free-purchase'
	| 'stripe-three-d-secure'
	| 'wechat'
	| 'existingCard'
	| `existingCard${ string }` // specific saved cards have unique slugs
	| 'stripe' // a synonym for 'card'
	| 'apple-pay' // a synonym for 'web-pay'
	| 'google-pay' // a synonym for 'web-pay'
	| 'razorpay';

/**
 * Payment method slugs as returned by the WPCOM backend.
 * These need to be translated to the values expected by
 * composite-checkout.
 */
export type WPCOMPaymentMethod =
	| 'WPCOM_Billing_WPCOM'
	| 'WPCOM_Billing_MoneyPress_Stored'
	| 'WPCOM_Billing_Ebanx'
	| 'WPCOM_Billing_Dlocal_Redirect_India_Netbanking'
	| 'WPCOM_Billing_PayPal_Direct'
	| 'WPCOM_Billing_PayPal_Express'
	| 'WPCOM_Billing_Stripe_Payment_Method'
	| 'WPCOM_Billing_Stripe_Alipay'
	| 'WPCOM_Billing_Stripe_Bancontact'
	| 'WPCOM_Billing_Stripe_Ideal'
	| 'WPCOM_Billing_Stripe_P24'
	| 'WPCOM_Billing_Stripe_Wechat_Pay'
	| 'WPCOM_Billing_Web_Payment'
	| 'WPCOM_Billing_Ebanx_Redirect_Brazil_Pix'
	| 'WPCOM_Billing_Razorpay';

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

export interface FailedPurchase {
	product_meta: string;
	product_id: string | number;
	product_slug: string;
	product_cost: string | number;
	product_name: string;
}

export interface VatDetails {
	country?: string | null;
	id?: string | null;
	name?: string | null;
	address?: string | null;
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

/**
 * Request parameter expected by the domain contact validation endpoint.
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
 * @see WPCOM_JSON_API_Domains_Validate_Contact_Information_Endpoint
 */
export type ContactValidationRequestContactInformation = {
	address_1?: string;
	address_2?: string;
	city?: string;
	country_code?: string;
	email?: string;
	extra?: DomainContactValidationRequestExtraFields;
	fax?: string;
	first_name?: string;
	last_name?: string;
	organization?: string;
	phone?: string;
	phone_number_country?: string;
	postal_code?: string;
	state?: string;
	vat_id?: string;
};

export type DomainContactValidationRequest = {
	contact_information: ContactValidationRequestContactInformation;
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
	is_for_business?: boolean;
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
	is_for_business?: boolean;
};

/**
 * Response format of the domain contact validation endpoint.
 */
export type ContactValidationResponseMessages = {
	first_name?: string[];
	last_name?: string[];
	organization?: string[];
	email?: string[];
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
			messages_simple: string[];
	  };

export type RawDomainContactValidationResponse =
	| { success: true }
	| {
			success: false;
			messages: RawContactValidationResponseMessages;
			messages_simple: string[];
	  };

export interface CountryListItemBase {
	code: string;
	name: string;
	has_postal_codes?: boolean;
	tax_needs_city?: boolean;
	tax_needs_subdivision?: boolean;
	tax_needs_organization?: boolean;
	tax_needs_address?: boolean;

	/**
	 * The localized name of the tax (eg: "VAT", "GST", etc.).
	 */
	tax_name?: string;
}
export interface CountryListItemWithoutVat extends CountryListItemBase {
	vat_supported: false;
}
export interface CountryListItemWithVat extends CountryListItemBase {
	vat_supported: true;
	tax_country_codes: string[];
}
export type CountryListItem = CountryListItemWithVat | CountryListItemWithoutVat;

export type SitelessCheckoutType = 'jetpack' | 'akismet' | 'marketplace' | undefined;
