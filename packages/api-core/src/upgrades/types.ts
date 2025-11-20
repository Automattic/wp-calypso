import { SubscriptionBillPeriod } from '../constants';

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
	maximum_price: number;
	maximum_price_display?: string | null;
	maximum_price_monthly_display?: string;

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
	 * The WordPress.com subscription ID number.
	 */
	ID: number;

	amount: number;

	/**
	 * The ID number of a WordPress.com purchase whose renewal will renew this
	 * purchase (eg: the plan or domain registration for a domain connection).
	 */
	attached_to_purchase_id: number | null;

	auto_renew_coupon_code: string | null;
	auto_renew_coupon_discount_percentage: number | null;

	/**
	 * The number of days in the bill period type. This is not necessarily the
	 * number of days in every billing period! It's just a numeric key that is
	 * close to the average billing period for this billing plan. For example,
	 * `31` means "monthly" although the expiry date may be fewer than 31 days
	 * from the last renewal. `-1` means that it does not expire.
	 */
	bill_period_days:
		| typeof SubscriptionBillPeriod.PLAN_ONE_TIME_PERIOD
		| typeof SubscriptionBillPeriod.PLAN_MONTHLY_PERIOD
		| typeof SubscriptionBillPeriod.PLAN_ANNUAL_PERIOD
		| typeof SubscriptionBillPeriod.PLAN_BIENNIAL_PERIOD
		| typeof SubscriptionBillPeriod.PLAN_TRIENNIAL_PERIOD
		| typeof SubscriptionBillPeriod.PLAN_QUADRENNIAL_PERIOD
		| typeof SubscriptionBillPeriod.PLAN_QUINQUENNIAL_PERIOD
		| typeof SubscriptionBillPeriod.PLAN_SEXENNIAL_PERIOD
		| typeof SubscriptionBillPeriod.PLAN_SEPTENNIAL_PERIOD
		| typeof SubscriptionBillPeriod.PLAN_OCTENNIAL_PERIOD
		| typeof SubscriptionBillPeriod.PLAN_NOVENNIAL_PERIOD
		| typeof SubscriptionBillPeriod.PLAN_DECENNIAL_PERIOD
		| typeof SubscriptionBillPeriod.PLAN_CENTENNIAL_PERIOD;

	bill_period_label: string;
	most_recent_renew_date: string;
	can_disable_auto_renew: boolean;
	can_reenable_auto_renewal: boolean;
	async_pending_payment_block_is_set: boolean;

	/**
	 * Similar to `is_renewable` except that this determines if the user is
	 * allowed to manually renew this subscription right now, whereas
	 * `is_renewable` only determines if the subscription is the kind of
	 * subscription that can be manually renewed.
	 */
	can_explicit_renew: boolean;

	/**
	 * If this upgrade is a plan and its domain credit was used to purchase a
	 * domain registration, and the plan is within its refund period, then
	 * `cost_to_unbundle_display` will be the formatted amount of the amount that
	 * would be withheld to keep the domain if the plan is cancelled.
	 *
	 * If there is nothing that would be withheld, this will be null.
	 */
	cost_to_unbundle_display: undefined | string;

	price_text: string;
	price_tier_list: Array< PriceTierEntry >;
	currency_code: string;
	currency_symbol: string;
	description: string;
	domain: string;
	domain_registration_agreement_url: string | undefined;
	blog_created_date: string;
	expiry_date: string;
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

	/**
	 * True if the subscription can be cancelled by the user (removed and
	 * possibly refunded). A subscription can be removable (see `is_removable`)
	 * even if it cannot be cancelled.
	 */
	is_cancelable: boolean;

	/**
	 * True if the subscription can be removed by the user (directly removed,
	 * without a refund). A subscription can still be cancelled (see
	 * `is_cancelable`) or refunded (see `is_refundable`) even if it is not
	 * removable.
	 */
	is_removable: boolean;

	/**
	 * True if this subscription has refundable receipts.
	 *
	 * If this is true, it means that it's possible the subscription could
	 * be refunded. It does not mean there is money that would be refunded! For
	 * that, check `total_refund_amount` instead. As an example, if a
	 * subscription has already been refunded, `is_refundable` may be true,
	 * but `total_refund_amount` will return a Store_Price of 0.
	 */
	is_refundable: boolean;

	/**
	 * True if this is a domain product (eg: registration, mapping, or transfer).
	 */
	is_domain: boolean;

	/**
	 * True if this is a domain registration product.
	 */
	is_domain_registration: boolean;

	is_trial_plan: boolean;
	is_pending_registration: boolean;
	is_free_jetpack_stats_product: boolean;
	is_jetpack_backup_t1: boolean;
	is_jetpack_legacy_plan: boolean;
	is_google_workspace_product: boolean;
	is_hundred_year_domain: boolean;
	is_iap_purchase: boolean;
	is_jetpack_plan_or_product: boolean;
	is_jetpack_ai_product: boolean;
	is_jetpack_stats_product: boolean;
	is_locked: boolean;
	is_plan: boolean;
	is_rechargable: boolean;
	is_woo_hosted_product: boolean;

	/**
	 * Determine if this is a kind of subscription that can currently be manually
	 * renewed by the user, even if it cannot be renewed by the user right now.
	 *
	 * `can_explicit_renew` instead checks if the subscription can be manually
	 * renewed right now.
	 */
	is_renewable: boolean;

	is_renewal: boolean;
	is_titan_mail_product: boolean;
	is_woo_express_trial: boolean;

	/**
	 * The domain name of this product, if any.
	 */
	meta: string | undefined;

	/**
	 * The Ownership number.
	 */
	ownership_id: number;

	partner_name: string | undefined;
	partner_slug: string | undefined;
	partner_type: string | undefined;
	partner_key_id: number | undefined;
	payment_name: string;

	/**
	 * The payment method attached to this subscription which will be re-used if
	 * the subscription renews and if auto-renew is turned on and if the payment
	 * method supports recharging.
	 *
	 * Typically this is the payment method last used to pay for this
	 * subscription, although it may have been changed.
	 *
	 * If there is no payment method set (eg: if the purchase was added manually
	 * by an admin), this will be undefined. If the subscription was purchased
	 * with credits, it will be `'credits'`.
	 */
	payment_type?:
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
		| 'razorpay'
		| 'Apple App Store'
		| 'Google Play App Store';

	payment_card_display_brand: string | null;
	payment_country_name: string;
	payment_country_code: string | null;
	stored_details_id: string | null;
	pending_transfer: boolean;

	/**
	 * The WordPress.com Store product_id.
	 */
	product_id: number;

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
	refund_options: RefundOptions[] | null;
	refund_period_in_days: number;
	regular_price_text: string;
	regular_price_integer: number;
	renew_date: string;

	sale_amount?: number;
	sale_amount_integer?: number;

	/**
	 * The WordPress.com site ID number.
	 */
	blog_id: number;

	blogname: string;

	/**
	 * The domain of the purchase's site. Sites can have multiple domains but
	 * this one will usually be the "cannonical" one as far as the user-facing
	 * domain, with a few caveats.
	 *
	 * If the site has a domain mapping or a custom domain registration, the
	 * primary one will be shown here.
	 *
	 * Note that if the domain name includes a path (eg: 'example.com/blog'), it
	 * will be included in this value!!
	 *
	 * If the site has a site redirect active, this will be the *.wordpress.com
	 * subdomain.
	 *
	 * If there is an active Jetpack site using a domain that is mapped to the
	 * given site, this will be the *.wordpress.com subdomain.
	 */
	site_slug: string;

	subscribed_date: string;
	subscription_status: 'active' | 'inactive';
	renewal_price_tier_usage_quantity: number | undefined | null;

	/**
	 * The WordPress.com user ID number.
	 */
	user_id: number;

	/**
	 * True if auto-renew is enabled.
	 *
	 * IMPORTANT: Just because auto-renew is enabled does not mean that the
	 * purchase will attempt to auto-renew. If a purchase does not have a
	 * payment method attached, no auto-renew will be attempted.
	 */
	is_auto_renew_enabled: boolean;

	payment_card_id: number | string | undefined;
	payment_card_type: string | undefined;
	payment_card_processor: string | undefined;
	payment_details: string | undefined;
	payment_expiry: string | undefined;

	/**
	 * True if this subscription can be upgraded to a different one.
	 *
	 * If this is set, we will display an "Upgrade" link in some places. That
	 * link will typically go to the plans page for the site or some other
	 * location depending on the product. To cause these buttons to instead add
	 * a product directly to the cart, also set `upgrade_product_slug`.
	 */
	is_upgradable: boolean;
}

export type RawPurchase = Purchase & {
	/**
	 * NOTE: this is currently a numeric string but we are trying to transition
	 * it to a number. By typing it as both, we force consumers to be able to
	 * handle both situations which should make the transition easier.
	 */
	ID: number | string;
	attached_to_purchase_id: number | string | null;
	ownership_id: number | string;
	product_id: number | string;
	blog_id: number | string;
	user_id: number | string;
	/**
	 * NOTE: this is currently the string "true" if true and undefined if
	 * false, but we are transitioning to a boolean. By typing it as both, we
	 * force consumers to be able to handle both situations which should make
	 * the transition easier.
	 */
	is_domain: boolean | 'true' | undefined;
	is_domain_registration: boolean | 'true' | undefined;
};

export interface PurchaseDowngradeOptions {
	type: 'downgrade';
	to_product_id: number;
}

export interface PurchaseCancelOptions {
	/**
	 * If this is a legacy premium theme the product_id is necessary to find
	 * the subscription.
	 */
	product_id: number;

	/**
	 * If true, when cancelling a plan that has a bundled domain, the domain
	 * will also be cancelled.
	 */
	cancel_bundled_domain: boolean;
}

/**
 * A feature that would be lost if the subscription is cancelled
 */
export interface CancellationFeature {
	/**
	 * Unique identifier for the feature (e.g., "feature-ad-free-experience")
	 */
	feature_id: string;

	/**
	 * Display title for the feature
	 */
	title: string;

	/**
	 * Description of what the feature provides
	 * May be empty string for some features
	 */
	description: string;
}

/**
 * Response from the upgrades cancel features endpoint
 * GET /wpcom/v2/upgrades/{subscription_id}/cancel-features
 */
export interface UpgradesCancelFeaturesResponse {
	/**
	 * The subscription ID that was requested
	 */
	subscription_id: number;

	/**
	 * The product ID associated with this subscription
	 */
	product_id: number;

	/**
	 * The product slug (e.g., "personal-bundle", "business-bundle")
	 */
	product_slug: string;

	/**
	 * Array of features that would be lost if this subscription is cancelled
	 */
	features: CancellationFeature[];
}
