import { PriceTierEntry } from '@automattic/calypso-products';

export interface Purchase {
	active?: boolean;
	amount: number;
	attachedToPurchaseId: number;
	billPeriodDays: number;
	billPeriodLabel: string;
	blogCreatedDate: string;
	canDisableAutoRenew: boolean;
	asyncPendingPaymentBlockIsSet: boolean;
	canExplicitRenew: boolean;
	canReenableAutoRenewal: boolean;
	costToUnbundle: number;
	costToUnbundleText: string;
	currencyCode: string;
	currencySymbol: string;
	description: string;
	domain: string;
	domainRegistrationAgreementUrl: string | null;
	error: null;
	expiryDate: string;
	expiryStatus: string;
	iapPurchaseManagementLink: string | null;
	id: number;
	includedDomain: string;
	includedDomainPurchaseAmount: number;
	introductoryOffer: PurchaseIntroductoryOffer | null;
	isAutoRenewEnabled: boolean;
	isCancelable: boolean;
	isDomain?: boolean;
	isDomainRegistration?: boolean;
	isHundredYearDomain?: boolean;
	isInAppPurchase: boolean;
	isLocked: boolean;
	isRechargeable: boolean;
	isRefundable: boolean;
	isRenewable: boolean;
	isRenewal: boolean;
	isWooExpressTrial: boolean;
	meta?: string;
	mostRecentRenewDate?: string;
	ownershipId?: number;
	partnerName: string | undefined;
	partnerSlug: string | undefined;
	partnerType: string | undefined;
	payment: PurchasePayment | PurchasePaymentWithCreditCard | PurchasePaymentWithPayPal;
	pendingTransfer: boolean;
	priceText: string;
	priceTierList?: Array< PurchasePriceTier >;
	productDisplayPrice: string;

	/**
	 * The renewal price of the purchase in the currency's smallest unit.
	 */
	priceInteger: number;

	productId: number;
	productName: string;
	productSlug: string;
	productType: string;
	purchaseRenewalQuantity: number | null;

	/**
	 * The refund amount for the purchase, not including bundled domains, as a
	 * float.
	 *
	 * Note that this currency may differ from the purchase's currency, so use
	 * `totalRefundCurrency` when formatting!
	 * @deprecated use `refundInteger`.
	 */
	refundAmount: number;

	/**
	 * The refund amount for the purchase, not including bundled domains, as an
	 * integer in the currency's smallest unit.
	 *
	 * Note that this currency may differ from the purchase's currency, so use
	 * `totalRefundCurrency` when formatting!
	 */
	refundInteger: number;

	refundOptions: RefundOptions | null;
	refundPeriodInDays: number;

	/**
	 * The refund amount for the purchase, not including bundled domains, as a
	 * formatted string.
	 *
	 * Note that this currency may differ from the purchase's currency, so use
	 * `totalRefundCurrency` when formatting!
	 * @deprecated use `refundInteger`.
	 */
	refundText: string;

	regularPriceText: string;

	/**
	 * The renewal price of the purchase in the currency's smallest unit when its
	 * introductory offer is complete.
	 */
	regularPriceInteger: number;

	renewDate: string;
	saleAmount?: number;
	saleAmountInteger?: number;
	siteId: number;
	siteName: string;
	subscribedDate: string;
	subscriptionStatus: 'active' | 'inactive';

	/**
	 * The refund amount, including bundled domains, in the currency's smallest
	 * unit.
	 *
	 * Note that this currency may differ from the purchase's currency, so use
	 * `totalRefundCurrency` when formatting!
	 */
	totalRefundInteger: number;

	/**
	 * The refund amount, including bundled domains, for the purchase as a float.
	 *
	 * Note that this currency may differ from the purchase's currency, so use
	 * `totalRefundCurrency` when formatting!
	 * @deprecated use `totalRefundInteger`.
	 */
	totalRefundAmount: number;

	/**
	 * The refund amount currency.
	 *
	 * Note that this currency may differ from the purchase's currency!
	 */
	totalRefundCurrency: string;

	/**
	 * The refund amount for the purchase, including bundled domains, as a
	 * formatted string.
	 * @deprecated use `totalRefundInteger` and `formatCurrency()`.
	 */
	totalRefundText: string;

	userId: number;
	userIsOwner?: boolean;
	partnerKeyId: number | undefined;
	tagLine: string;
	taxAmount: number | string | undefined;
	taxText: string | undefined;

	/**
	 * The coupon code that will automatically apply on the next renewal.
	 */
	autoRenewCouponCode: string | null;
	/**
	 * The discount percentage applied automatically by the coupon on the next renewal.
	 * Example: If the discount is 10%, this will have the value `10`.
	 */
	autoRenewCouponDiscountPercentage: number | null;
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

export interface RawPurchase {
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
	is_hundred_year_domain: boolean;
	is_locked: boolean;
	is_iap_purchase: boolean;
	is_rechargable: boolean;
	is_refundable: boolean;
	is_renewable: boolean;
	is_renewal: boolean;
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

export type RawPurchaseCreditCard = RawPurchase & {
	payment_type: 'credit_card';
	payment_card_type: string;
	payment_card_display_brand: string | null;
	payment_card_processor: string;
	payment_details: string | number;
	payment_expiry: string;
};

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

export interface PurchaseIntroductoryOffer {
	costPerInterval: number;
	endDate: string;
	intervalCount: number;
	intervalUnit: string;
	isWithinPeriod: boolean;
	transitionAfterRenewalCount: number;
	isNextRenewalUsingOffer: boolean;
	remainingRenewalsUsingOffer: number;
	shouldProrateWhenOfferEnds: boolean;
	isNextRenewalProrated: boolean;
}

export interface PurchasePayment {
	name: string | undefined;
	type: string | undefined;
	countryCode: string | undefined | null;
	countryName: string | undefined;
	storedDetailsId: string | number | undefined | null;
	expiryDate?: string;
	creditCard?: PurchasePaymentCreditCard;
}

/**
 * A Purchase.payment where Purchase.payment_type === 'paypal_direct'
 */
export type PurchasePaymentWithPayPal = PurchasePayment & {
	name: string;
	countryCode: string | undefined | null;
	countryName: string | undefined;
	storedDetailsId: string | number;
	type: string;
	expiryDate: string;
};

/**
 * A Purchase.payment where Purchase.payment_type === 'credit_card'
 */
export type PurchasePaymentWithCreditCard = PurchasePayment & {
	name: string;
	countryCode: string | undefined | null;
	countryName: string | undefined;
	storedDetailsId: string | number;
	type: string;
	displayBrand: string | null;
	creditCard: PurchasePaymentCreditCard;
};

export interface PurchasePaymentCreditCard {
	id: number;
	type: string;
	displayBrand: string | null;
	processor: string;
	number: string;
	expiryDate: string;
}
