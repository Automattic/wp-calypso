import { PriceTierEntry } from '@automattic/calypso-products';

export interface Purchase {
	active?: boolean;
	amount: number;
	attachedToPurchaseId: number;
	billPeriodDays: number;
	billPeriodLabel: string;
	blogCreatedDate: string;
	canDisableAutoRenew: boolean;
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
	isDomainRegistration?: boolean;
	isInAppPurchase: boolean;
	isLocked: boolean;
	isRechargeable: boolean;
	isRefundable: boolean;
	isRenewable: boolean;
	isRenewal: boolean;
	meta?: string;
	mostRecentRenewDate?: string;
	partnerName: string | undefined;
	partnerSlug: string | undefined;
	payment: PurchasePayment | PurchasePaymentWithCreditCard | PurchasePaymentWithPayPal;
	pendingTransfer: boolean;
	priceText: string;
	priceTierList?: Array< PurchasePriceTier >;
	productDisplayPrice: string;
	productId: number;
	productName: string;
	productSlug: string;
	purchaseRenewalQuantity: number | null;
	refundAmount: number;
	refundOptions: RefundOptions | null;
	refundPeriodInDays: number;
	refundText: string;
	regularPriceText: string;
	renewDate: string;
	saleAmount?: number;
	siteId: number;
	siteName: string;
	subscribedDate: string;
	subscriptionStatus: 'active' | 'inactive';
	totalRefundAmount: number;
	totalRefundText: string;
	userId: number;
	partnerKeyId: number | undefined;
	tagLine: string;
	taxAmount: number | string | undefined;
	taxText: string | undefined;
}

export interface PurchasePriceTier {
	minimumUnits: number;
	maximumUnits?: undefined | null | number;
	minimumPrice: number;
	maximumPrice: number;
	minimumPriceDisplay: string;
	maximumPriceDisplay?: string | null | undefined;
}

export interface RawPurchasedPriceTierEntry extends PriceTierEntry {
	minimum_price_monthly_display: never;
	maximum_price_monthly_display: never;
}

export interface RawPurchase {
	ID: number | string;
	active: boolean;
	amount: number | string;
	attached_to_purchase_id: number | string;
	bill_period_days: number | string;
	bill_period_label: string;
	most_recent_renew_date: string;
	can_disable_auto_renew: boolean;
	can_reenable_auto_renewal: boolean;
	can_explicit_renew: boolean;
	cost_to_unbundle: undefined | number | string;
	cost_to_unbundle_display: undefined | string;
	price_text: string;
	price_tier_list?: Array< RawPurchasedPriceTierEntry >;
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
	is_domain_registration: boolean;
	is_locked: boolean;
	is_iap_purchase: boolean;
	is_rechargable: boolean;
	is_refundable: boolean;
	is_renewable: boolean;
	is_renewal: boolean;
	meta: string | undefined;
	partner_name: string | undefined;
	partner_slug: string | undefined;
	partner_key_id: number | undefined;
	payment_name: string;
	payment_type:
		| 'credit_card'
		| 'paypal_direct'
		| 'paypal'
		| 'emergent-paywall'
		| 'brazil-tef'
		| string;
	payment_country_name: string;
	payment_country_code: string | null;
	stored_details_id: string | null;
	pending_transfer: boolean;
	product_id: number | string;
	product_name: string;
	product_slug: string;
	product_display_price: string;
	total_refund_amount: number | undefined;
	total_refund_text: string;
	refund_amount: number;
	refund_text: string;
	refund_currency_symbol: string;
	refund_options: RefundOptions | null;
	refund_period_in_days: number;
	regular_price_text: string;
	renew_date: string;
	sale_amount: number | undefined;
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
	creditCard: PurchasePaymentCreditCard;
};

export interface PurchasePaymentCreditCard {
	id: number;
	type: string;
	processor: string;
	number: string;
	expiryDate: string;
}

export interface MembershipSubscription {
	ID: string;
	currency: string;
	end_date: string | null;
	product_id: string;
	renew_interval: string | null;
	renewal_price: string;
	site_id: string;
	site_title: string;
	site_url: string;
	start_date: string;
	status: string;
	title: string;
}

export interface MembershipSubscriptionsSite {
	id: string;
	name: string;
	domain: string;
	subscriptions: MembershipSubscription[];
}
