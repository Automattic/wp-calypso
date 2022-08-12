// TODO: complete this type
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
	iapPurchaseManagementLink?: string;
	id: number;
	includedDomain: string;
	includedDomainPurchaseAmount: number;
	introductoryOffer: {
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
	} | null;
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
	partnerName: string;
	partnerSlug: string;
	payment: PurchasePayment;
	pendingTransfer: boolean;
	priceText: string;
	productDisplayPrice: string;
	productId: number;
	productName: string;
	productSlug: string;
	purchaseRenewalQuantity: number | null;
	refundAmount: number;
	refundOptions:
		| { to_product_id: number; refund_amount: number; refund_currency_symbol: string }[]
		| null;
	refundPeriodInDays: number;
	refundText: string;
	regularPriceText: string;
	renewDate: string;
	saleAmount?: number;
	siteId: number;
	siteName: string;
	subscribedDate: string;
	subscriptionStatus: string;
	totalRefundAmount: number;
	totalRefundText: string;
	userId: number;
}

export interface PurchasePayment {
	name: string | undefined;
	type: string | undefined;
	countryCode: string | undefined;
	countryName: string | undefined;
	storedDetailsId: string | number | undefined;
	expiryDate?: string; // Only for payment.type === 'paypal_direct'
	creditCard?: PurchasePaymentCreditCard; // Only for payment.type === 'credit_card'
}

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
