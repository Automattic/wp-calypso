import type { Dispatch } from 'react';

export type ShoppingCartReducerDispatch = ( action: ShoppingCartAction ) => void;

export type ShoppingCartReducer = (
	state: ShoppingCartState,
	action: ShoppingCartAction
) => ShoppingCartState;

export type GetCart = ( cartKey: string ) => Promise< ResponseCart >;
export type SetCart = ( cartKey: string, requestCart: RequestCart ) => Promise< ResponseCart >;

export interface ShoppingCartManagerOptions {
	refetchOnWindowFocus?: boolean;
	defaultCartKey?: string;
}

export type GetManagerForKey = ( cartKey: string | undefined ) => ShoppingCartManager;

export interface ShoppingCartManagerClient {
	forCartKey: GetManagerForKey;
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
}

export type ShoppingCartError = 'GET_SERVER_CART_ERROR' | 'SET_SERVER_CART_ERROR';

export type ShoppingCartState = {
	responseCart: TempResponseCart;
	lastValidResponseCart: ResponseCart;
	couponStatus: CouponStatus;
	cacheStatus: CacheStatus;
	loadingError?: string;
	loadingErrorType?: ShoppingCartError;
	queuedActions: ShoppingCartAction[];
};

export interface WithShoppingCartProps {
	shoppingCartManager: UseShoppingCart;
	cart: ResponseCart;
}

export type CartValidCallback = ( cart: ResponseCart ) => void;

export type DispatchAndWaitForValid = ( action: ShoppingCartAction ) => Promise< ResponseCart >;

export interface ActionPromises {
	resolve: ( tempResponseCart: TempResponseCart ) => void;
	add: ( resolve: ( value: ResponseCart ) => void ) => void;
}

export interface CartSyncManager {
	syncPendingCartToServer: (
		state: ShoppingCartState,
		dispatch: Dispatch< ShoppingCartAction >
	) => void;
	fetchInitialCartFromServer: ( dispatch: Dispatch< ShoppingCartAction > ) => void;
}

export interface RequestCart {
	products: RequestCartProduct[];
	tax: RequestCartTaxData;
	coupon: string;
	currency: string;
	locale: string;
	is_coupon_applied: boolean;
	temporary: false;
	extra: string;
}

export type RequestCartTaxData = null | {
	location: {
		country_code: string | undefined;
		postal_code: string | undefined;
		subdivision_code: string | undefined;
	};
};

export interface RequestCartProduct {
	product_slug: string;
	product_id: number;
	meta: string;
	volume: number;
	quantity: number | null;
	extra: RequestCartProductExtra;
}

export type MinimalRequestCartProduct = Partial< RequestCartProduct > &
	Pick< RequestCartProduct, 'product_slug' | 'product_id' >;

export interface ResponseCart< P = ResponseCartProduct > {
	blog_id: number | string;
	create_new_blog: boolean;
	cart_key: string;
	products: P[];
	total_tax: string; // Please try not to use this
	total_tax_integer: number;
	total_tax_display: string;
	total_tax_breakdown: TaxBreakdownItem[];
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
	tax: ResponseCartTaxData;
	next_domain_is_free: boolean;
	next_domain_condition: '' | 'blog';
	bundled_domain?: string;
	terms_of_service?: TermsOfServiceRecord[];
}

export interface ResponseCartTaxData {
	location: {
		country_code?: string;
		postal_code?: string;
		subdivision_code?: string;
	};
	display_taxes: boolean;
}

export interface TaxBreakdownItem {
	tax_collected: number;
	tax_collected_integer: number;
	tax_collected_display: string;
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
	product_name: string;
	product_slug: string;
	product_id: number;
	currency: string;
	product_cost_integer: number;
	product_cost_display: string;
	has_bundle_credit?: boolean;
	item_original_cost_integer: number; // without discounts or volume, with quantity
	item_original_cost_display: string; // without discounts or volume, with quantity
	item_subtotal_monthly_cost_display: string;
	item_subtotal_monthly_cost_integer: number;
	item_original_subtotal_integer: number; // without discounts, with volume
	item_original_subtotal_display: string; // without discounts, with volume
	item_original_cost_for_quantity_one_integer: number; // without discounts or volume, and quantity 1
	item_original_cost_for_quantity_one_display: string; // without discounts or volume, and quantity 1
	item_subtotal_integer: number;
	item_subtotal_display: string;
	price_tier_minimum_units?: number | null;
	price_tier_maximum_units?: number | null;
	is_domain_registration: boolean;
	is_bundled: boolean;
	is_sale_coupon_applied: boolean;
	meta: string;
	time_added_to_cart: number;
	bill_period: string;
	months_per_bill_period: number | null;
	volume: number;
	quantity: number | null;
	current_quantity: number | null;
	extra: ResponseCartProductExtra;
	uuid: string;
	cost: number;
	cost_before_coupon?: number;
	coupon_savings?: number;
	coupon_savings_display?: string;
	coupon_savings_integer?: number;
	price: number;
	product_type: string;
	included_domain_purchase_amount: number;
	is_renewal?: boolean;
	subscription_id?: string;
	introductory_offer_terms?: IntroductoryOfferTerms;

	// Temporary optional properties for the monthly pricing test
	related_monthly_plan_cost_display?: string;
	related_monthly_plan_cost_integer?: number;
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
}

export interface ResponseCartProductExtra {
	context?: string;
	source?: string;
	premium?: boolean;
	new_quantity?: number;
	domain_to_bundle?: string;
	google_apps_users?: GSuiteProductUser[];
	google_apps_registration_data?: DomainContactDetails;
	purchaseType?: string;
	privacy?: boolean;
	afterPurchaseUrl?: string;
	isJetpackCheckout?: boolean;
}

export interface RequestCartProductExtra extends ResponseCartProductExtra {
	purchaseId?: string;
	isJetpackCheckout?: boolean;
	jetpackSiteSlug?: string;
	jetpackPurchaseToken?: string;
}

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

export interface TermsOfServiceRecord {
	key: string;
	code: string;
	args?: Record< string, string >;
}
