/**
 * There are three different concepts of "cart" relevant to the shopping cart endpoint:
 *
 *     1. The response format of the cart endpoint (GET)
 *     2. The response format of the cart endpoint (POST)
 *     3. The request format required by the cart endpoint (POST)
 *
 * In practice the response formats of GET and POST request are not exactly the same,
 * but we define here an object type with properties common to both which is sufficient
 * for checkout.
 *
 * The POST endpoint has its own ad-hoc request format for the cart. We make this explicit
 * and define a function for converting the response cart into a request cart.
 *
 * @see WPCOM_JSON_API_Me_Shopping_Cart_Endpoint
 */

/**
 * Request schema for the shopping cart endpoint
 */
export interface RequestCart {
	products: RequestCartProduct[];
	tax: null | {
		location: {
			country_code: string | undefined;
			postal_code: string | undefined;
			subdivision_code: string | undefined;
		};
	};
	coupon: string;
	currency: string;
	locale: string;
	is_coupon_applied: boolean;
	temporary: false;
	extra: string;
	is_update?: boolean;
}

/**
 * Product item schema for the shopping cart endpoint (request)
 */
export interface RequestCartProduct {
	product_slug: string;
	product_id: number;
	meta: string;
	volume: number;
	extra: ResponseCartProductExtra;
}

/**
 * Response schema for the shopping cart endpoint
 */
export interface ResponseCart< P = ResponseCartProduct > {
	blog_id: number | string;
	create_new_blog: boolean;
	cart_key: string;
	products: P[];
	total_tax_integer: number;
	total_tax_display: string;
	total_cost: number; // Please try not to use this
	total_cost_integer: number;
	total_cost_display: string;
	coupon_savings_total_integer: number;
	coupon_savings_total_display: string;
	savings_total_integer: number;
	savings_total_display: string;
	sub_total_with_taxes_integer: number;
	sub_total_with_taxes_display: string;
	sub_total_integer: number;
	sub_total_display: string;
	currency: string;
	credits_integer: number;
	credits_display: string;
	allowed_payment_methods: string[];
	coupon: string;
	is_coupon_applied: boolean;
	coupon_discounts_integer: number[];
	locale: string;
	is_signup: boolean;
	messages?: ResponseCartMessages;
	cart_generated_at_timestamp: number;
	tax: {
		location: {
			country_code?: string;
			postal_code?: string;
			subdivision_code?: string;
		};
		display_taxes: boolean;
	};
}

/**
 * Local schema for response cart that can contain incomplete products. This
 * schema is only used inside the reducer and will only differ from a
 * ResponseCart if the cacheStatus is invalid.
 */
export type TempResponseCart = ResponseCart< RequestCartProduct >;

export interface ResponseCartMessages {
	errors?: ResponseCartMessage[];
	success?: ResponseCartMessage[];
}

export interface ResponseCartMessage {
	code: string;
	message: string;
}

/**
 * Product item schema for the shopping cart endpoint (response)
 */
export interface ResponseCartProduct {
	product_name: string;
	product_slug: string;
	product_id: number;
	currency: string;
	product_cost_integer: number;
	product_cost_display: string;
	item_original_cost_integer: number; // without discounts or volume
	item_original_cost_display: string; // without discounts or volume
	item_subtotal_monthly_cost_display: string;
	item_subtotal_monthly_cost_integer: number;
	item_original_subtotal_integer: number; // without discounts, with volume
	item_original_subtotal_display: string; // without discounts, with volume
	item_subtotal_integer: number;
	item_subtotal_display: string;
	is_domain_registration: boolean;
	is_bundled: boolean;
	is_sale_coupon_applied: boolean;
	meta: string;
	months_per_bill_period: number | null;
	volume: number;
	extra: ResponseCartProductExtra;
	uuid: string;
	cost: number;
	price: number;
	product_type: string;
	included_domain_purchase_amount: number;
	is_renewal?: boolean;
	subscription_id?: string;

	// Temporary optional properties for the monthly pricing test
	related_monthly_plan_cost_display?: string;
	related_monthly_plan_cost_integer?: number;
}

export interface CartLocation {
	countryCode: string | null;
	postalCode: string | null;
	subdivisionCode: string | null;
}

export type ResponseCartProductExtra = {
	context?: string;
	source?: string;
	domain_to_bundle?: string;
	google_apps_users?: GSuiteProductUser[];
	google_apps_registration_data?: DomainContactDetails;
	purchaseId?: string;
	purchaseDomain?: string;
	purchaseType?: string;
	includedDomain?: string;
	privacy?: boolean;
};

export interface GSuiteProductUser {
	firstname: string;
	lastname: string;
	email: string;
	password: string;
}

export type DomainContactDetails = {
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
	extra?: DomainContactDetailsExtra;
};

export type DomainContactDetailsExtra = {
	ca?: CaDomainContactExtraDetails | null;
	uk?: UkDomainContactExtraDetails | null;
	fr?: FrDomainContactExtraDetails | null;
};

export type CaDomainContactExtraDetails = {
	lang?: string;
	legalType?: string;
	ciraAgreementAccepted?: boolean;
};

export type UkDomainContactExtraDetails = {
	registrantType?: string;
	registrationNumber?: string;
	tradingName?: string;
};

export type FrDomainContactExtraDetails = {
	registrantType?: string;
	registrantVatId?: string;
	trademarkNumber?: string;
	sirenSiret?: string;
};
