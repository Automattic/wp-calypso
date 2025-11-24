import { PriceTierEntry } from '@automattic/calypso-products';

export interface Purchase {
	amount: number;
	attachedToPurchaseId: number;
	billPeriodDays: number;
	billPeriodLabel: string;
	blogCreatedDate: string;
	canDisableAutoRenew: boolean;
	asyncPendingPaymentBlockIsSet: boolean;
	canExplicitRenew: boolean;
	canReenableAutoRenewal: boolean;

	/**
	 * If this upgrade is a domain and a domain credit was used to purchase it,
	 * and the plan is within its refund period, then `cost_to_unbundle_display`
	 * will be the formatted amount of the amount that would be withheld to keep
	 * the domain if the plan is cancelled.
	 *
	 * If there is nothing that would be withheld, this will be null.
	 */
	costToUnbundleText: string;

	currencyCode: string;
	currencySymbol: string;
	description: string;

	/**
	 * The domain name of the site associated with the purchase.
	 *
	 * IMPORTANT: this is not necessarily the primary domain of the site. This
	 * can cause issues for Atomic sites if you try to use it for things that
	 * expect the primary domain, like routing.
	 *
	 * To get the primary domain instead, use `siteSlug`.
	 */
	domain: string;

	domainRegistrationAgreementUrl: string | null;
	expiryDate: string;
	expiryStatus: string;
	iapPurchaseManagementLink: string | null;
	id: number;

	/**
	 * If this subscription is for a plan with a bundled domain, this will
	 * contain the domain name for that domain subscription. Otherwise this will
	 * be an empty string.
	 */
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

	refundOptions: RefundOptions[] | null;
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

	/**
	 * The primary domain for the site that owns this purchase.
	 */
	siteSlug?: string;

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

	/**
	 * The coupon code that will automatically apply on the next renewal.
	 */
	autoRenewCouponCode: string | null;
	/**
	 * The discount percentage applied automatically by the coupon on the next renewal.
	 * Example: If the discount is 10%, this will have the value `10`.
	 */
	autoRenewCouponDiscountPercentage: number | null;

	isJetpackPlanOrProduct: boolean;
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

export type { RawPurchase } from '@automattic/api-core';

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
	paymentPartner?: string;
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
