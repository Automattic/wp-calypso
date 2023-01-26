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

export type UpdateTaxLocationInCart = ( location: CartLocation ) => Promise< ResponseCart >;

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
	| { type: 'SET_LOCATION'; location: CartLocation }
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
	blog_id?: number | string;
	cart_key?: CartKey;
	products: RequestCartProduct[];
	tax: RequestCartTaxData;
	coupon: string;
	temporary: false;
	create_new_blog?: boolean;
}

export type RequestCartTaxData = null | {
	location: {
		country_code: string | undefined;
		postal_code: string | undefined;
		subdivision_code: string | undefined;
		vat_id?: string;
		organization?: string;
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
	blog_id: number | string;
	create_new_blog: boolean;
	cart_key: CartKey;
	products: P[];

	/**
	 * The amount of tax collected.
	 *
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
	 *
	 * @deprecated This is a float and is unreliable. Use total_cost_integer.
	 */
	total_cost: number;

	/**
	 * The cart's total cost in the currency's smallest unit.
	 */
	total_cost_integer: number;

	/**
	 * The difference between `cost_before_coupon` and the actual price for all
	 * products in the currency's smallest unit.
	 *
	 * Note that the difference may be caused by many factors, not just coupons.
	 * It's best not to rely on it.
	 */
	coupon_savings_total_integer: number;

	/**
	 * The subtotal with taxes included in the currency's smallest unit.
	 */
	sub_total_with_taxes_integer: number;

	/**
	 * The subtotal without taxes included in the currency's smallest unit.
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
	coupon_discounts_integer: number[];
	locale: string;
	is_signup: boolean;
	messages?: ResponseCartMessages;
	cart_generated_at_timestamp: number;
	tax: ResponseCartTaxData;
	next_domain_is_free: boolean;
	next_domain_condition: '' | 'blog';
	bundled_domain?: string;
	has_bundle_credit?: boolean;
	terms_of_service?: TermsOfServiceRecord[];
	has_pending_payment?: boolean;
}

export interface ResponseCartTaxData {
	location: {
		country_code?: string;
		postal_code?: string;
		subdivision_code?: string;
		vat_id?: string;
		organization?: string;
	};
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

	/**
	 * The cart item's original price in the currency's smallest unit.
	 *
	 * @deprecated Use item_original_cost_integer or item_original_subtotal_integer.
	 */
	product_cost_integer: number;

	/**
	 * The cart item's original price without volume in the currency's smallest unit.
	 *
	 * Discounts and volume are not included, but quantity is included.
	 */
	item_original_cost_integer: number;

	/**
	 * The monthly term subtotal of a cart item in the currency's smallest unit.
	 */
	item_subtotal_monthly_cost_integer: number;

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
	 */
	item_subtotal_integer: number;

	/**
	 * The cart item's subtotal without volume.
	 *
	 * @deprecated This is a float and is unreliable. Use item_subtotal_integer
	 */
	cost: number;

	/**
	 * The cart item's price before a coupon (if any) was applied.
	 *
	 * This is slightly misleading because although this is the product's cost
	 * before a coupon was applied, it already includes sale coupons (which are
	 * actually discounts), and other discounts and does not include certain
	 * other price changes (eg: domain discounts). It's best not to rely on it.
	 *
	 * @deprecated This is a float and is unreliable. Use
	 * item_original_subtotal_integer if you
	 * can, although those have slightly different meanings.
	 */
	cost_before_coupon?: number;

	/**
	 * The difference between `cost_before_coupon` and the actual price.
	 *
	 * Note that the difference may be caused by many factors, not just coupons.
	 * It's best not to rely on it.
	 *
	 * @deprecated This is a float and is unreliable. Use coupon_savings_integer
	 */
	coupon_savings?: number;

	/**
	 * The difference between `cost_before_coupon` and the actual price in the currency's smallest unit.
	 *
	 * Note that the difference may be caused by many factors, not just coupons.
	 * It's best not to rely on it.
	 */
	coupon_savings_integer?: number;

	price_tier_minimum_units?: number | null;
	price_tier_maximum_units?: number | null;

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
	product_type: string;
	included_domain_purchase_amount: number;

	/**
	 * True if the product is a renewal.
	 *
	 * This does not get set for `RequestCartProduct` which instead uses
	 * `extra.purchaseType` set to 'renewal'.
	 */
	is_renewal?: boolean;

	subscription_id?: string;
	introductory_offer_terms?: IntroductoryOfferTerms;

	/**
	 * True if the cart item represents a purchase for a different user's site.
	 */
	is_gift_purchase?: boolean;

	product_variants: ResponseCartProductVariant[];

	// Temporary optional properties for the monthly pricing test
	related_monthly_plan_cost_display?: string;
	related_monthly_plan_cost_integer?: number;
}

export interface ResponseCartProductVariant {
	product_id: number;
	bill_period_in_months: number;
	product_slug: string;
	currency: string;
	price_integer: number;
	price_before_discounts_integer: number;
	introductory_offer_terms:
		| Record< string, never >
		| Pick< IntroductoryOfferTerms, 'interval_unit' | 'interval_count' >;
}

export interface IntroductoryOfferTerms {
	enabled: boolean;
	interval_unit: string;
	interval_count: number;
	reason?: string;
	transition_after_renewal_count: number;
	should_prorate_when_offer_ends: boolean;
}

export interface CartLocation {
	countryCode?: string;
	postalCode?: string;
	subdivisionCode?: string;
	vatId?: string;
	organization?: string;
}

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

	// Marketplace properties
	is_marketplace_product?: boolean;
	plugin_slug?: boolean;
}

export interface ResponseCartGiftDetails {
	receiver_blog_id: number;
	receiver_blog_slug?: string;
	receiver_blog_url?: string;
}

export interface RequestCartProductExtra extends ResponseCartProductExtra {
	purchaseId?: string;
	isJetpackCheckout?: boolean;
	isGiftPurchase?: boolean;
	jetpackSiteSlug?: string;
	jetpackPurchaseToken?: string;
	auth_code?: string;
	privacy_available?: boolean;
	selected_page_titles?: string[];
	site_title?: string;
	signup_flow?: string;
	signup?: boolean;
	headstart_theme?: string;
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
	args?: Record< string, string >;
}
