import wpcom from 'calypso/lib/wp';

export interface RefundOptions {
	to_product_id: number;
	refund_amount: number;
	refund_currency_symbol: string;
}

export interface RawPurchaseIntroductoryOffer {
	cost_per_interval: number;
	end_date: string;
	interval_count: number;
	interval_unit: string;
	is_within_period: boolean;
	transition_after_renewal_count: number;
	is_next_renewal_using_offer: boolean;
	remaining_renewals_using_offer: number;
	should_prorate_when_offer_ends: boolean;
	is_next_renewal_prorated: boolean;
}

export interface PriceTierEntry {
	minimum_units: number;
	maximum_units?: undefined | null | number;
	minimum_price: number;
	minimum_price_display: string;
	minimum_price_monthly_display?: string | null | undefined;
	maximum_price: number;
	maximum_price_display?: string | null | undefined;
	maximum_price_monthly_display?: string | null | undefined;
	/**
	 * If set, is used to transform the usage/quantity of units used to derive the number of units
	 * we want to bill the customer for, before multiplying by the per_unit_fee.
	 *
	 * To put simply, the purpose of this attribute is to bill the customer at a different granularity compared to their usage.
	 */
	transform_quantity_divide_by?: number | null | undefined;
	/**
	 * Used for rounding the number of units we want to bill the customer for (which is derived after dividing the
	 * usage/quantity of units by the `transform_quantity_divide_by` number).
	 *
	 * Used only when `transform_quantity_divide_by` is set. Possible values are: `up`, `down`
	 */
	transform_quantity_round?: string | null | undefined;
	/**
	 * The amount in the currency's smallest unit that this tier costs per unit.
	 */
	per_unit_fee?: number | null | undefined;
	/**
	 * The amount in the currency's smallest unit that this tier costs as a flat fee (for the entire tier).
	 */
	flat_fee?: number | null | undefined;
}

export interface PurchasePriceTier {
	minimumUnits: number;
	maximumUnits?: undefined | null | number;
	minimumPrice: number;
	maximumPrice: number;
	minimumPriceDisplay: string;
	maximumPriceDisplay?: string | null | undefined;
}

export interface RawPurchasePriceTierEntry extends PriceTierEntry {
	minimum_price_monthly_display: never;
	maximum_price_monthly_display: never;
}

export interface ActiveSubscription {
	ID: number | string;
	active: boolean;
	amount: number | string;
	attached_to_purchase_id: number | string;
	auto_renew_coupon_code: string | null;
	auto_renew_coupon_discount_percentage: number | null;
	bill_period_days: number | string;
	bill_period_label: string;
	most_recent_renew_date: string;
	can_disable_auto_renew: boolean;
	can_reenable_auto_renewal: boolean;
	async_pending_payment_block_is_set: boolean;
	can_explicit_renew: boolean;
	cost_to_unbundle: undefined | number | string;
	cost_to_unbundle_display: undefined | string;
	price_text: string;
	price_tier_list?: Array< RawPurchasePriceTierEntry >;
	currency_code: string;
	currency_symbol: string;
	description: string;
	domain: string;
	domain_registration_agreement_url: string | undefined;
	blog_created_date: string;
	expiry_date: string;
	expiry_status: string;
	iap_purchase_management_link: string | null;
	included_domain: string;
	included_domain_purchase_amount: number;
	introductory_offer: RawPurchaseIntroductoryOffer | null;
	is_cancelable: boolean;
	is_domain: boolean;
	is_domain_registration: boolean;
	is_free_jetpack_stats_product: boolean;
	is_google_workspace_product: boolean;
	is_hundred_year_domain: boolean;
	is_iap_purchase: boolean;
	is_jetpack_ai_product: boolean;
	is_jetpack_stats_product: boolean;
	is_locked: boolean;
	is_plan: boolean;
	is_rechargable: boolean;
	is_refundable: boolean;
	is_renewable: boolean;
	is_renewal: boolean;
	is_titan_mail_product: boolean;
	is_woo_express_trial: boolean;
	meta: string | undefined;
	ownership_id: number | undefined;
	partner_name: string | undefined;
	partner_slug: string | undefined;
	partner_type: string | undefined;
	partner_key_id: number | undefined;
	payment_name: string;
	payment_type:
		| 'credit_card'
		| 'paypal_direct'
		| 'paypal'
		| 'emergent-paywall'
		| 'brazil-tef'
		| string;
	payment_card_display_brand: string | null;
	payment_country_name: string;
	payment_country_code: string | null;
	stored_details_id: string | null;
	pending_transfer: boolean;
	product_id: number | string;
	product_name: string;
	product_slug: string;
	product_type: string;
	product_display_price: string;
	price_integer: number;
	purchaser_id?: number;
	total_refund_amount: number | undefined;
	total_refund_currency: string;
	total_refund_integer: number;
	total_refund_text: string;
	refund_amount: number;
	refund_integer: number;
	refund_text: string;
	refund_currency_symbol: string;
	refund_options: RefundOptions | null;
	refund_period_in_days: number;
	regular_price_text: string;
	regular_price_integer: number;
	renew_date: string;
	sale_amount: number | undefined;
	sale_amount_integer: number | undefined;
	blog_id: number | string;
	blogname: string;
	site_slug?: string;
	subscribed_date: string;
	subscription_status: 'active' | 'inactive';
	tag_line: string;
	tax_amount: number | string | undefined;
	tax_text: string | undefined;
	renewal_price_tier_usage_quantity: number | undefined | null;
	user_id: number | string;
	auto_renew: '1' | '0' | null;
	payment_card_id: number | string | undefined;
	payment_card_type: string | undefined;
	payment_card_processor: string | undefined;
	payment_details: string | undefined;
	payment_expiry: string | undefined;
}

export async function fetchActiveSubscriptionsForUser( options?: {
	siteId?: string | number;
} ): Promise< ActiveSubscription[] > {
	if ( options?.siteId ) {
		return await wpcom.req.get( {
			path: `/sites/${ encodeURIComponent( options.siteId ) }/purchases`,
			apiVersion: '1.1',
		} );
	}
	return await wpcom.req.get( {
		path: '/me/purchases',
		apiVersion: '1.1',
	} );
}
