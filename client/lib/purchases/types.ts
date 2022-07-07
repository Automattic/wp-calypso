// TODO: complete this type
export interface Purchase {
	active?: boolean;
	id: number;
	userId: number;
	saleAmount?: number;
	amount: number;
	meta?: string;
	isRechargeable: boolean;
	isDomainRegistration?: boolean;
	productName: string;
	currencyCode: string;
	expiryDate: string;
	renewDate: string;
	mostRecentRenewDate?: string;
	productSlug: string;
	productDisplayPrice: string;
	siteId: number;
	subscribedDate: string;
	payment: PurchasePayment;
	subscriptionStatus: string;
	domain: string;
	isLocked: boolean;
	isInAppPurchase: boolean;
	iapPurchaseManagementLink?: string;
	attachedToPurchaseId: number;
	billPeriodDays: number;
	billPeriodLabel: string;
	canDisableAutoRenew: boolean;
	canReenableAutoRenewal: boolean;
	canExplicitRenew: boolean;
	costToUnbundle: number;
	costToUnbundleText: string;
	currencySymbol: string;
	description: string;
	domainRegistrationAgreementUrl: any;
	error: any;
	blogCreatedDate: string;
	expiryStatus: string;
	includedDomain: string;
	includedDomainPurchaseAmount: number;
	introductoryOffer: any;
	isCancelable: boolean;
	isRefundable: boolean;
	isRenewable: boolean;
	isRenewal: boolean;
	priceText: string;
	partnerName: string;
	partnerSlug: string;
	pendingTransfer: boolean;
	productId: number;
	totalRefundAmount: number;
	totalRefundText: string;
	refundAmount: number;
	refundOptions: any;
	refundText: string;
	refundPeriodInDays: number;
	regularPriceText: string;
	siteName: string;
	purchaseRenewalQuantity: any;
	isAutoRenewEnabled: boolean;
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
