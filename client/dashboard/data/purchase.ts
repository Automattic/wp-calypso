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
	maximum_units?: null | number;
	minimum_price: number;
	minimum_price_display: string;
	minimum_price_monthly_display?: string | null;
	maximum_price: number;
	maximum_price_display?: string | null;
	maximum_price_monthly_display?: string | null;

	/**
	 * If set, is used to transform the usage/quantity of units used to derive the number of units
	 * we want to bill the customer for, before multiplying by the per_unit_fee.
	 *
	 * To put simply, the purpose of this attribute is to bill the customer at a different granularity compared to their usage.
	 */
	transform_quantity_divide_by?: number | null;

	/**
	 * Used for rounding the number of units we want to bill the customer for (which is derived after dividing the
	 * usage/quantity of units by the `transform_quantity_divide_by` number).
	 *
	 * Used only when `transform_quantity_divide_by` is set. Possible values are: `up`, `down`
	 */
	transform_quantity_round?: string | null;

	/**
	 * The amount in the currency's smallest unit that this tier costs per unit.
	 */
	per_unit_fee?: number | null;

	/**
	 * The amount in the currency's smallest unit that this tier costs as a flat fee (for the entire tier).
	 */
	flat_fee?: number | null;
}

export interface PurchasePriceTier {
	minimumUnits: number;
	maximumUnits?: null | number;
	minimumPrice: number;
	maximumPrice: number;
	minimumPriceDisplay: string;
	maximumPriceDisplay?: string | null;
}

export interface RawPurchasePriceTierEntry extends PriceTierEntry {
	/**
	 * The formatted minimum price for the tier.
	 */
	minimum_price_monthly_display: string;

	/**
	 * The formatted maxiumum price for the tier, if any.
	 */
	maximum_price_monthly_display: string | null;
}

/**
 * A subscription or one-time purchase.
 *
 * To determine if the subscription is active or not, use the
 * `subscription_status` property.
 *
 * Corresponds to a WordPress.com Store Subscription.
 */
export interface Purchase {
	/**
	 * The WordPress.com subscription ID number as a string.
	 */
	ID: string;

	amount: number;
	attached_to_purchase_id: string | null;
	auto_renew_coupon_code: string | null;
	auto_renew_coupon_discount_percentage: number | null;

	/**
	 * The number of days in the bill period type. This is not necessarily the
	 * number of days in every billing period! It's just a numeric key that is
	 * close to the average billing period for this billing plan. For example,
	 * `31` means "monthly" although the expiry date may be fewer than 31 days
	 * from the last renewal.
	 */
	bill_period_days: number;

	bill_period_label: string;
	most_recent_renew_date: string;
	can_disable_auto_renew: boolean;
	can_reenable_auto_renewal: boolean;
	async_pending_payment_block_is_set: boolean;
	can_explicit_renew: boolean;
	cost_to_unbundle: undefined | number | string;
	cost_to_unbundle_display: undefined | string;
	price_text: string;
	price_tier_list: Array< RawPurchasePriceTierEntry >;
	currency_code: string;
	currency_symbol: string;
	description: string;
	domain: string;
	domain_registration_agreement_url: string | undefined;
	blog_created_date: string;
	expiry_date: string;
	expiry_message: string;
	expiry_sub_message: string;
	expiry_status:
		| 'expiring'
		| 'included'
		| 'auto-renewing'
		| 'active'
		| 'manual-renew'
		| 'expired'
		| 'one-time-purchase';
	iap_purchase_management_link: string | null;
	included_domain: string;
	included_domain_purchase_amount: number;
	introductory_offer: RawPurchaseIntroductoryOffer | null;
	is_cancelable: boolean;

	/**
	 * If this is a domain product (eg: registration, mapping, or transfer), it
	 * will be the string 'true'.
	 */
	is_domain?: 'true';

	is_domain_registration: boolean;
	is_free_jetpack_stats_product: boolean;
	is_google_workspace_product: boolean;
	is_hundred_year_domain: boolean;
	is_iap_purchase: boolean;
	is_jetpack_plan_or_product: boolean;
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

	/**
	 * The domain name of this product, if any.
	 */
	meta: string | undefined;

	/**
	 * The Ownership number as a string.
	 */
	ownership_id: string;

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
		| 'id_wallet'
		| 'netbanking'
		| 'tef'
		| 'credits'
		| 'upi'
		| 'razorpay';
	payment_card_display_brand: string | null;
	payment_country_name: string;
	payment_country_code: string | null;
	stored_details_id: string | null;
	pending_transfer: boolean;

	/**
	 * The WordPress.com Store product_id number as a string.
	 */
	product_id: string;

	product_name: string;
	product_slug: string;
	product_type: string;
	product_display_price: string;
	price_integer: number;
	total_refund_amount: number;
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

	sale_amount?: number;
	sale_amount_integer?: number;

	/**
	 * The WordPress.com site ID number, as a string. Eg: '12345'.
	 */
	blog_id: string;

	blogname: string;
	site_slug?: string;
	subscribed_date: string;
	subscription_status: 'active' | 'inactive';
	tag_line?: string;
	renewal_price_tier_usage_quantity: number | undefined | null;

	/**
	 * The WordPress.com user ID number as a string. Eg: '12345'.
	 */
	user_id: string;

	auto_renew: '1' | '0' | null;
	payment_card_id: number | string | undefined;
	payment_card_type: string | undefined;
	payment_card_processor: string | undefined;
	payment_details: string | undefined;
	payment_expiry: string | undefined;
}
