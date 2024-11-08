import type { CartActionError } from './errors';
import type { Dispatch } from 'react';

export type ShoppingCartReducerDispatch = ( action: ShoppingCartAction ) => void;

export type ShoppingCartReducer = (
	state: ShoppingCartState,
	action: ShoppingCartAction
) => ShoppingCartState;

export type CartKey = number | 'no-user' | 'no-site';

export type GetCart = ( cartKey: CartKey ) => Promise< ResponseCart >;
export type SetCart = ( cartKey: CartKey, requestCart: RequestCart ) => Promise< ResponseCart >;

export interface ShoppingCartManagerOptions {
	refetchOnWindowFocus?: boolean;
	defaultCartKey?: CartKey;
}

export type GetManagerForKey = ( cartKey: CartKey | undefined ) => ShoppingCartManager;
export type GetCartKeyForSiteSlug = ( siteSlug: string ) => Promise< CartKey >;

export interface ShoppingCartManagerClient {
	forCartKey: GetManagerForKey;
	getCartKeyForSiteSlug: GetCartKeyForSiteSlug;
}

export type UnsubscribeFunction = () => void;

export type SubscribeCallback = () => void;

export type ShoppingCartManagerSubscribe = ( callback: SubscribeCallback ) => UnsubscribeFunction;

export interface SubscriptionManager {
	subscribe: ShoppingCartManagerSubscribe;
	notifySubscribers: () => void;
}

export interface ShoppingCartManagerState {
	isLoading: boolean;
	loadingError: string | null | undefined;
	loadingErrorType: ShoppingCartError | undefined;
	isPendingUpdate: boolean;
	responseCart: ResponseCart;
	couponStatus: CouponStatus;
}

type WaitForReady = () => Promise< ResponseCart >;

export type ShoppingCartManagerGetState = () => ShoppingCartManagerState;

export interface ShoppingCartManager {
	getState: ShoppingCartManagerGetState;
	subscribe: ShoppingCartManagerSubscribe;
	actions: ShoppingCartManagerActions;
	fetchInitialCart: WaitForReady;
}

export type UseShoppingCart = ShoppingCartManagerActions & ShoppingCartManagerState;

export type ReplaceProductInCart = (
	uuidToReplace: string,
	productPropertiesToChange: Partial< RequestCartProduct >
) => Promise< ResponseCart >;

export type ReloadCartFromServer = () => Promise< ResponseCart >;

export type ClearCartMessages = () => Promise< ResponseCart >;

export type ReplaceProductsInCart = (
	products: MinimalRequestCartProduct[]
) => Promise< ResponseCart >;

export type AddProductsToCart = (
	products: MinimalRequestCartProduct[]
) => Promise< ResponseCart >;

export type RemoveCouponFromCart = () => Promise< ResponseCart >;

export type ApplyCouponToCart = ( couponId: string ) => Promise< ResponseCart >;

export type RemoveProductFromCart = ( uuidToRemove: string ) => Promise< ResponseCart >;

export type UpdateTaxLocationInCart = ( location: TaxLocationUpdate ) => Promise< ResponseCart >;

export type SetCouponFieldVisible = ( couponFieldVisible: boolean ) => void;

export type RemoveCouponAndClearField = () => Promise< ResponseCart< ResponseCartProduct > >;

/**
 * The custom hook keeps a cached version of the server cart, as well as a
 * cache status.
 *
 *   - 'fresh': Page has loaded and no requests have been sent.
 *   - 'fresh-pending': Page has loaded and we are waiting for the initial request.
 *   - 'invalid': Local cart data has been edited.
 *   - 'valid': Local cart has been reloaded from the server.
 *   - 'pending': Request has been sent, awaiting response.
 *   - 'error': Something went wrong.
 */
export type CacheStatus = 'fresh' | 'fresh-pending' | 'valid' | 'invalid' | 'pending' | 'error';

/**
 * Possible states re. coupon submission.
 *
 *   - 'fresh': User has not (yet) attempted to apply a coupon.
 *   - 'pending': Coupon request has been sent, awaiting response.
 *   - 'applied': Coupon has been applied to the cart.
 *   - 'rejected': Coupon code did not apply. The reason should be in the cart errors.
 */
export type CouponStatus = 'fresh' | 'pending' | 'applied' | 'rejected';

export type ShoppingCartAction =
	| { type: 'CLEAR_QUEUED_ACTIONS' }
	| { type: 'CLEAR_MESSAGES' }
	| { type: 'UPDATE_LAST_VALID_CART' }
	| { type: 'REMOVE_CART_ITEM'; uuidToRemove: string }
	| { type: 'CART_PRODUCTS_ADD'; products: RequestCartProduct[] }
	| { type: 'CART_PRODUCTS_REPLACE_ALL'; products: RequestCartProduct[] }
	| { type: 'SET_LOCATION'; location: TaxLocationUpdate }
	| {
			type: 'CART_PRODUCT_REPLACE';
			uuidToReplace: string;
			productPropertiesToChange: Partial< RequestCartProduct >;
	  }
	| { type: 'ADD_COUPON'; couponToAdd: string }
	| { type: 'REMOVE_COUPON' }
	| { type: 'CART_RELOAD' }
	| { type: 'RECEIVE_INITIAL_RESPONSE_CART'; initialResponseCart: ResponseCart }
	| { type: 'FETCH_INITIAL_RESPONSE_CART' }
	| { type: 'REQUEST_UPDATED_RESPONSE_CART' }
	| { type: 'RECEIVE_UPDATED_RESPONSE_CART'; updatedResponseCart: ResponseCart }
	| { type: 'RAISE_ERROR'; error: ShoppingCartError; message: string };

export interface ShoppingCartManagerActions {
	addProductsToCart: AddProductsToCart;
	removeProductFromCart: RemoveProductFromCart;
	applyCoupon: ApplyCouponToCart;
	removeCoupon: RemoveCouponFromCart;
	updateLocation: UpdateTaxLocationInCart;
	replaceProductInCart: ReplaceProductInCart;
	replaceProductsInCart: ReplaceProductsInCart;
	reloadFromServer: ReloadCartFromServer;
	clearMessages: ClearCartMessages;
}

export type ShoppingCartError = 'GET_SERVER_CART_ERROR' | 'SET_SERVER_CART_ERROR';

export type ShoppingCartState = {
	responseCart: TempResponseCart;
	lastValidResponseCart: ResponseCart;
	couponStatus: CouponStatus;
	queuedActions: ShoppingCartAction[];
} & (
	| {
			cacheStatus: Exclude< CacheStatus, 'error' >;
			loadingError?: undefined;
			loadingErrorType?: undefined;
	  }
	| {
			cacheStatus: 'error';
			loadingError: string;
			loadingErrorType: ShoppingCartError;
	  }
);

export interface WithShoppingCartProps {
	shoppingCartManager: UseShoppingCart;
	cart: ResponseCart;
}

export type CartValidCallback = ( cart: ResponseCart ) => void;

export type DispatchAndWaitForValid = ( action: ShoppingCartAction ) => Promise< ResponseCart >;

export type SavedActionPromise = {
	resolve: ( responseCart: ResponseCart ) => void;
	reject: ( error: CartActionError ) => void;
};

export interface ActionPromises {
	resolve: ( tempResponseCart: TempResponseCart ) => void;
	reject: ( error: CartActionError ) => void;
	add: ( actionPromise: SavedActionPromise ) => void;
}

export interface CartSyncManager {
	syncPendingCartToServer: (
		state: ShoppingCartState,
		dispatch: Dispatch< ShoppingCartAction >
	) => void;
	fetchInitialCartFromServer: ( dispatch: Dispatch< ShoppingCartAction > ) => void;
}

export interface RequestCart {
	blog_id: number;
	cart_key?: CartKey;
	products: RequestCartProduct[];
	tax: RequestCartTaxData;
	coupon: string;
	temporary: false;
}

export type RequestCartTaxData = null | {
	location: {
		country_code: string | undefined;
		postal_code: string | undefined;
		subdivision_code: string | undefined;
		vat_id?: string;
		organization?: string;
		address?: string;
		city?: string;
		is_for_business?: boolean;
	};
};

export interface RequestCartProduct {
	product_slug: string;
	product_id?: number;
	meta: string;
	volume: number;
	quantity: number | null;
	extra: RequestCartProductExtra;
}

export type MinimalRequestCartProduct = Partial< RequestCartProduct > &
	Pick< RequestCartProduct, 'product_slug' >;

export interface ResponseCart< P = ResponseCartProduct > {
	blog_id: number;
	cart_key: CartKey;
	products: P[];

	/**
	 * The amount of tax collected.
	 * @deprecated This is a float and is unreliable. Use total_tax_integer.
	 */
	total_tax: string;

	/**
	 * The amount of tax collected in the currency's smallest unit.
	 */
	total_tax_integer: number;

	/**
	 * The amount of tax collected per product.
	 */
	total_tax_breakdown: TaxBreakdownItem[];

	/**
	 * The cart's total cost.
	 * @deprecated This is a float and is unreliable. Use total_cost_integer.
	 */
	total_cost: number;

	/**
	 * The cart's total cost in the currency's smallest unit.
	 */
	total_cost_integer: number;

	/**
	 * The difference between the cost before any coupon and the actual price
	 * for all products in the currency's smallest unit.
	 *
	 * Note that the difference may be caused by many factors, not just coupons.
	 * It's best not to rely on it.
	 */
	coupon_savings_total_integer: number;

	/**
	 * The subtotal with taxes included in the currency's smallest unit.
	 *
	 * This is the sum of each item's price with all discounts (including
	 * coupons), but without taxes. This does not include credits!
	 */
	sub_total_with_taxes_integer: number;

	/**
	 * The subtotal without taxes included in the currency's smallest unit.
	 *
	 * This is the sum of each item's price with all discounts (including
	 * coupons), but without taxes. This does not include credits!
	 */
	sub_total_integer: number;

	/**
	 * The number of credits available in the currency's smallest unit.
	 */
	credits_integer: number;

	/**
	 * Gift Details
	 */
	gift_details?: ResponseCartGiftDetails;

	/**
	 * True if the cart contains a purchase for a different user's site.
	 */
	is_gift_purchase?: boolean;

	currency: string;
	allowed_payment_methods: string[];
	coupon: string;
	is_coupon_applied: boolean;
	has_auto_renew_coupon_been_automatically_applied: boolean;
	locale: string;
	is_signup: boolean;
	messages?: ResponseCartMessages;
	cart_generated_at_timestamp: number;
	tax: ResponseCartTaxData;
	next_domain_is_free: boolean;
	next_domain_condition: '' | 'blog';
	bundled_domain?: string;
	terms_of_service?: TermsOfServiceRecord[];
	has_pending_payment?: boolean;
}

export interface ResponseCartTaxLocation {
	country_code?: string;
	postal_code?: string;
	subdivision_code?: string;
	vat_id?: string;
	organization?: string;
	address?: string;
	city?: string;
	is_for_business?: boolean;
}

export interface ResponseCartTaxData {
	location: ResponseCartTaxLocation;
	display_taxes: boolean;
}

export interface TaxBreakdownItem {
	tax_collected: number;
	tax_collected_integer: number;
	label?: string;
	rate: number;
	rate_display: string;
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
	persistent_errors?: ResponseCartMessage[];
}

export interface ResponseCartMessage {
	code: string;
	message: string;
}

export interface ResponseCartProduct {
	uuid: string;
	product_name: string;
	product_slug: string;
	product_id: number;
	currency: string;

	product_name_en: string;

	/**
	 * The cart item's original price without volume in the currency's smallest unit.
	 *
	 * Discounts and volume are not included, but quantity is included.
	 */
	item_original_cost_integer: number;

	/**
	 * The monthly term original price of a cart item in the currency's smallest unit.
	 */
	item_original_monthly_cost_integer: number;

	/**
	 * The cart item's original price with volume in the currency's smallest unit.
	 *
	 * Discounts are not included, but volume and quantity are included.
	 */
	item_original_subtotal_integer: number;

	/**
	 * The cart item's original price for quantity 1 in the currency's smallest unit.
	 *
	 * Discounts are not included, but volume is included.
	 */
	item_original_cost_for_quantity_one_integer: number;

	/**
	 * The cart item's subtotal in the currency's smallest unit.
	 *
	 * This is the cost of the item with all discounts (including coupons),
	 * but without taxes.
	 */
	item_subtotal_integer: number;

	/**
	 * The cart item's subtotal without volume.
	 * @deprecated This is a float and is unreliable. Use item_subtotal_integer
	 */
	cost: number;

	/**
	 * The amount of the local currency deducted by an applied coupon, if any.
	 * This is in the currency's smallest unit.
	 */
	coupon_savings_integer?: number;

	price_tier_minimum_units?: number | null;
	price_tier_maximum_units?: number | null;

	/**
	 * A cost override is a change to the price of a product. The new price and the old (original) price are both provided.
	 *
	 * The override_code is a string that identifies the reason for the override.
	 * When displaying the reason to the customer, use the human_readable_reason.
	 */
	cost_overrides: ResponseCartCostOverride[];

	/**
	 * If set, is used to transform the usage/quantity of units used to derive the number of units
	 * we want to bill the customer for, before applying the per unit cost.
	 *
	 * To put simply, the purpose of this attribute is to bill the customer at a different granularity compared to their usage.
	 */
	price_tier_transform_quantity_divide_by?: number | null;

	/**
	 * Used for rounding the number of units we want to bill the customer for (which is derived after dividing the
	 * usage/quantity of units by the `price_tier_transform_quantity_divide_by` number).
	 *
	 * Used only when `$this->price_tier_transform_quantity_divide_by` is set. Possible values are: `up`, `down`
	 */
	price_tier_transform_quantity_round?: string | null;
	is_domain_registration: boolean;
	is_bundled: boolean;
	is_sale_coupon_applied: boolean;
	meta: string;
	time_added_to_cart: number;

	/**
	 * The billing term in days in numeric format, but as a string.
	 *
	 * Typically one of '31' (monthly), '365' (annual), or '730' (biennial).
	 *
	 * Similar to `months_per_bill_period`.
	 */
	bill_period: string;

	/**
	 * The billing term in months in numeric format.
	 *
	 * Typically one of 1 (monthly), 12 (annual), or 24 (biennial).
	 *
	 * Similar to `bill_period`.
	 */
	months_per_bill_period: number | null;

	volume: number;
	quantity: number | null;
	current_quantity: number | null;
	extra: ResponseCartProductExtra;
	item_tax: number;
	item_tax_rate?: number;
	product_type: string;
	included_domain_purchase_amount: number;

	/**
	 * True if the product is a renewal.
	 *
	 * This does not get set for `RequestCartProduct` which instead uses
	 * `extra.purchaseType` set to 'renewal'.
	 */
	is_renewal?: boolean;

	/**
	 * True if the product is a renewal and the subscription will auto-renew.
	 *
	 * A subscription will auto-renew if it both can auto-renew (it's a recurring subscription,
	 * has a payment method, isn't blocked, etc.) and the user has auto-renew enabled.
	 */
	is_renewal_and_will_auto_renew?: boolean;

	/**
	 * True if the product will not renew.
	 */
	is_one_time_purchase?: boolean;

	subscription_id?: string;
	introductory_offer_terms?: IntroductoryOfferTerms;

	/**
	 * True if the cart item represents a purchase for a different user's site.
	 */
	is_gift_purchase?: boolean;

	/**
	 * True if cart item is a domain that is included in a 100 Year Plan
	 */
	is_included_for_100yearplan: boolean;

	/**
	 * If set, this is the ID of the payment method attached to the existing
	 * subscription for this product. This will only be set for renewals and
	 * only if the renewal has a payment method attached.
	 */
	stored_details_id?: string;

	product_variants: ResponseCartProductVariant[];
}

export interface ResponseCartProductVariant {
	product_id: number;
	bill_period_in_months: number;
	product_slug: string;
	currency: string;
	price_integer: number;
	price_before_discounts_integer: number;
	introductory_offer_discount_integer: number;
	introductory_offer_terms:
		| Record< string, never >
		| Pick< IntroductoryOfferTerms, 'interval_unit' | 'interval_count' >;
	volume?: number;
}

export interface ResponseCartCostOverride {
	human_readable_reason: string;
	new_subtotal_integer: number;
	old_subtotal_integer: number;
	override_code: string;
	does_override_original_cost: boolean;
	percentage: number;
	first_unit_only: boolean;
}

export type IntroductoryOfferUnit = 'day' | 'week' | 'month' | 'year' | 'indefinite';

export interface IntroductoryOfferTerms {
	/**
	 * True if the introductory offer is active on this product.
	 */
	enabled: boolean;

	/**
	 * The unit that, when combined with `interval_count`, determines how long
	 * the introductory offer disount should be applied.
	 */
	interval_unit: IntroductoryOfferUnit;

	/**
	 * The count that, when combined with `interval_unit`, determines how long
	 * the introductory offer lasts. eg: if `interval_count` is 3 and
	 * `interval_unit` is 'month', the discount lasts for 3 months (but always
	 * ends before the next renewal unless `transition_after_renewal_count` is
	 * set). If the `interval_unit` is 'month' and the product normally renews
	 * yearly, then the first renewal will be based on `interval_count` (eg:
	 * after 3 months) instead.
	 *
	 * Note that we sometimes renew products a 30 days before their expiry
	 * date, so in the above example, we would likely renew at the 2 month mark
	 * instead.
	 */
	interval_count: number;

	/**
	 * If the introductory offer is not active (if `enabled` is false), the
	 * reason will probably be a human-readable reason why (although it may not
	 * exist even then).
	 */
	reason?: string;

	/**
	 * The number of times the introductory offer cost and period will be used
	 * during renewals before using the regular cost and period. If this is 0,
	 * the discount will last just for the initial purchase; otherwise it will
	 * last for additional renewals also.
	 */
	transition_after_renewal_count: number;

	/**
	 * True if the last discounted renewal will subtract the introductory offer
	 * period from the full period when calculating the price. For example: if
	 * you provide a 3 month free trial on a yearly plan, the first renewal
	 * would only cover 9 months (12 – 3 months). This reduced period is also
	 * reflected in the renewal price, as the user will only pay for the 9
	 * months instead of the full year.
	 */
	should_prorate_when_offer_ends: boolean;
}

/**
 * The data passed to the `updateLocation()` cart manager action.
 *
 * To convert this to the data used by the cart's `tax.location` property, use
 * `convertLocationUpdateToTaxLocation()`.
 */
export interface TaxLocationUpdate {
	countryCode?: string;
	postalCode?: string;
	subdivisionCode?: string;
	vatId?: string;
	organization?: string;
	address?: string;
	city?: string;
	isForBusiness?: boolean;
}

/**
 * Legacy alias for `TaxLocationUpdate`.
 * @deprecated Use `TaxLocationUpdate`
 */
export type CartLocation = TaxLocationUpdate;

export type DomainLegalAgreementUrl = string;
export type DomainLegalAgreementTitle = string;
export type DomainLegalAgreements = Record< DomainLegalAgreementUrl, DomainLegalAgreementTitle >;

export interface ResponseCartProductExtra {
	context?: string;
	source?: string;
	premium?: boolean;
	new_quantity?: number;
	domain_to_bundle?: string;
	email_users?: TitanProductUser[];
	google_apps_users?: GSuiteProductUser[];
	google_apps_registration_data?: DomainContactDetails;
	receipt_for_domain?: number;
	domain_registration_agreement_url?: string;
	legal_agreements?: never[] | DomainLegalAgreements;
	is_gravatar_domain?: boolean;

	/**
	 * Set to 'renewal' if requesting a renewal.
	 *
	 * Often this does not need to be explicitly set because the shopping cart
	 * endpoint will automatically make a requested product into a renewal if the
	 * product is already owned.
	 *
	 * This is not set for `ResponseCartProduct` objects which use `is_renewal`
	 * instead.
	 */
	purchaseType?: string;

	afterPurchaseUrl?: string;
	isJetpackCheckout?: boolean;
	isAkismetSitelessCheckout?: boolean;
	isMarketplaceSitelessCheckout?: boolean;

	/**
	 * Marketplace properties
	 *
	 * These extra properties are always set for marketplace products.
	 * `product_slug` is for identifying the product, and `product_type` is for identifying the type of the product.
	 */
	is_marketplace_product?: boolean;
	product_slug?: string;
	product_type?: 'marketplace_plugin' | 'marketplace_theme' | 'saas_plugin';

	/**
	 * True when:
	 * - the product has variants ( e.g. annual plan vs. monthly plan vs. multi-year plan )
	 * - we only want to show the single product selected by the user
	 * - we want to prevent the user from switching to a variant
	 *
	 * This will hide product variant UI elements in checkout ( line item variant dropdown or variant upsells )
	 */
	hideProductVariants?: boolean;
}

export interface ResponseCartGiftDetails {
	receiver_blog_id: number;
	receiver_blog_slug?: string;
	receiver_blog_url?: string;
}

export interface RequestCartProductExtra extends ResponseCartProductExtra {
	purchaseId?: string;
	isAkismetSitelessCheckout?: boolean;
	isJetpackCheckout?: boolean;
	isMarketplaceSitelessCheckout?: boolean;
	intentId?: number;
	isGiftPurchase?: boolean;
	jetpackSiteSlug?: string;
	jetpackPurchaseToken?: string;
	auth_code?: string;
	privacy_available?: boolean;
	selected_page_titles?: string[];
	site_title?: string;
	signup_flow?: string;
	import_dns_records?: boolean;
	signup?: boolean;
	headstart_theme?: string;
	feature_slug?: string;
	is_hundred_year_domain?: boolean;
	/**
	 * A way to signal intent to the back end when included as an extra with
	 * certain products.
	 *
	 * The only current usage is on Creator plan products that are bought
	 * on flow `/setup/site-migration`. If value `'migrate` is passed the
	 * Atomic DB will be created with UTF-8 encoding, which is a requirement
	 * for Migration Guru, our new tool for handling migrations. This extra
	 * can be removed once all migration flows are using Migration Guru.
	 *
	 */
	hosting_intent?: string;
}

export interface GSuiteProductUser {
	firstname: string;
	lastname: string;
	email: string;
	password: string;
	recoveryEmail?: string;
}

export interface TitanProductUser {
	alternative_email?: string;
	email: string;
	encrypted_password?: string;
	is_admin?: boolean;
	name?: string;
	password?: string;
}

export type DomainContactDetails = {
	firstName?: string;
	lastName?: string;
	organization?: string;
	email?: string;
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

export interface TermsOfServiceRecord {
	key: string;
	code: string;
	args?: TermsOfServiceRecordArgsBase | TermsOfServiceRecordArgsRenewal;
}

export interface TermsOfServiceRecordArgsBase {
	/**
	 * The date that the subscription will begin, formatted as a ISO 8601 date
	 * (eg: `2004-02-12T15:19:21+00:00`).
	 */
	subscription_start_date: string;

	/**
	 * The `meta` value of the product (eg: its domain name). May be an empty
	 * string if there is no meta.
	 */
	product_meta: string;

	/**
	 * The human readable name of the product.
	 */
	product_name: string;

	/**
	 * The store product ID.
	 */
	product_id: number;

	/**
	 * The price of the next renewal of this product. This may be based on the
	 * product's billing term (eg: in two years for a biennial plan) or the
	 * billing term of the introductory offer, if it differs (eg: in 3 months for
	 * a 3 month free trial of an annual plan).
	 *
	 * If an introductory offer applies for more than one renewal, this will be
	 * the price of the next renewal only, NOT the price of the renewal after the
	 * offer ends!
	 *
	 * This price is locale-formatted with a currency symbol.
	 * @deprecated use renewal_price_integer and format manually
	 */
	renewal_price: string;

	/**
	 * The price of the next renewal of this product. This may be based on the
	 * product's billing term (eg: in two years for a biennial plan) or the
	 * billing term of the introductory offer, if it differs (eg: in 3 months for
	 * a 3 month free trial of an annual plan).
	 *
	 * If an introductory offer applies for more than one renewal, this will be
	 * the price of the next renewal only, NOT the price of the renewal after the
	 * offer ends!
	 *
	 * This price is an integer in the currency's smallest unit.
	 */
	renewal_price_integer: number;

	/**
	 * The price of the product after the promotional pricing expires. If the
	 * next auto-renewal after the price expires would prorate the renewal price,
	 * this DOES NOT include that proration. See
	 * `maybe_prorated_regular_renewal_price_integer` for the price with that proration
	 * included.
	 *
	 * This price is locale-formatted with a currency symbol.
	 * @deprecated use regular_renewal_price_integer and format manually
	 */
	regular_renewal_price: string;

	/**
	 * The price of the product after the promotional pricing expires. If the
	 * next auto-renewal after the price expires would prorate the renewal price,
	 * this DOES NOT include that proration. See
	 * `maybe_prorated_regular_renewal_price_integer` for the price with that proration
	 * included.
	 *
	 * This price is an integer in the currency's smallest unit.
	 */
	regular_renewal_price_integer: number;

	/**
	 * The price of the product for the renewal immediately after the promotional
	 * pricing expires. If the next auto-renewal after the price expires would
	 * prorate the renewal price, this DOES include that proration. See
	 * `regular_renewal_price_integer` for the price without that proration
	 * included.
	 *
	 * This is the price that we will attempt to charge on
	 * `subscription_maybe_prorated_regular_auto_renew_date`.
	 *
	 * This price is an integer in the currency's smallest unit.
	 */
	maybe_prorated_regular_renewal_price_integer: number;

	/**
	 * True if the product in the cart which has these terms is a manual renewal
	 * (as opposed to a new purchase or a quantity upgrade).
	 */
	is_renewal: boolean;

	/**
	 * The number of auto-renewals after the current purchase completes which
	 * will be affected by the promotional pricing. If the product is affected by
	 * a prorated introductory offer, then the auto-renewal where the user will
	 * be charged the prorated price is not counted by this number.
	 */
	remaining_promotional_auto_renewals: number;
}

export interface TermsOfServiceRecordArgsRenewal extends TermsOfServiceRecordArgsBase {
	/**
	 * The date that the promotional pricing will end, formatted as a ISO 8601
	 * date (eg: `2004-02-12T15:19:21+00:00`). This may be the date that an
	 * auto-renew will be attempted with the non-promotional price, but if the
	 * subscription renews earlier than the expiry date, the renewal may happen
	 * earlier than this date. See `subscription_regular_auto_renew_date` for
	 * the actual date of the non-promotional renewal.
	 *
	 * Only set if we can easily determine when the product will renew. Does not
	 * apply to domain transfers or multi-year domains.
	 */
	subscription_end_of_promotion_date: string;

	/**
	 * This date that an auto-renew will be attempted with the non-promotional
	 * possibly prorated price (`maybe_prorated_regular_renewal_price_integer`).
	 *
	 * This is ISO 8601 formatted (eg: `2004-02-12T15:19:21+00:00`).
	 *
	 * Only set if we can easily determine when the product will renew. Does not
	 * apply to domain transfers or multi-year domains.
	 */
	subscription_maybe_prorated_regular_auto_renew_date: string;

	/**
	 * This date that an auto-renew will be attempted with the non-promotional
	 * regular recurring price (`regular_renewal_price_integer`).
	 *
	 * This is ISO 8601 formatted (eg: `2004-02-12T15:19:21+00:00`).
	 *
	 * Only set if we can easily determine when the product will renew. Does not
	 * apply to domain transfers or multi-year domains.
	 */
	subscription_regular_auto_renew_date: string;

	/**
	 * The date when the product's subscription will expire if not renewed. This
	 * might be its renewal date, but it might not be since we often renew
	 * products earlier than their expiry date.
	 *
	 * This is ISO 8601 formatted (eg: `2004-02-12T15:19:21+00:00`).
	 *
	 * Only set if we can easily determine when the product will renew. Does not
	 * apply to domain transfers or multi-year domains.
	 */
	subscription_expiry_date: string;

	/**
	 * The date when the product's subscription will next automatically attempt a
	 * renewal. Note that this may not be the end of the promotional price, since
	 * some promotions apply to renewals also.
	 *
	 * This is ISO 8601 formatted (eg: `2004-02-12T15:19:21+00:00`).
	 *
	 * Only set if we can easily determine when the product will renew. Does not
	 * apply to domain transfers or multi-year domains.
	 */
	subscription_auto_renew_date: string;

	/**
	 * The number of days before the renewal attempt when the user will receive a
	 * pre-renewal reminder email.
	 *
	 * Only set if we can easily determine when the product will renew. Does not
	 * apply to domain transfers or multi-year domains.
	 */
	subscription_pre_renew_reminder_days: number;

	/**
	 * The number of pre-renewal emails the user will receive.
	 *
	 * Typically this is 1 or 0. For example, monthly subscriptions don't usually
	 * get a pre-renewal email.
	 *
	 * Only set if we can easily determine when the product will renew. Does not
	 * apply to domain transfers or multi-year domains.
	 */
	subscription_pre_renew_reminders_count: number;
}
