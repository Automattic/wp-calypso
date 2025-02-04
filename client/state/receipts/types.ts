import type { Purchase } from '@automattic/wpcom-checkout';

export interface ReceiptPurchase {
	delayedProvisioning: boolean;
	freeTrial: boolean;
	isDomainRegistration: boolean;
	meta: string;
	productId: string | number;
	productSlug: string;
	productType: string;
	productName: string;
	productNameShort: string;
	registrarSupportUrl: string;
	isEmailVerified: boolean;
	isRootDomainWithUs: boolean;
	isHundredYearDomain: boolean;
	isRenewal: boolean;
	willAutoRenew: boolean;
	saasRedirectUrl: string;
	newQuantity: number | undefined;
	blogId: number;
	priceInteger: number;
}

export interface FailedReceiptPurchase {
	meta: string;
	productId: string | number;
	productSlug: string;
	productCost: string | number;
	productName: string;
}

export interface RawReceiptData {
	receipt_id: string;
	display_price: string;
	price_float: number;
	price_integer: number;
	currency: string;
	purchases: Purchase[] | undefined | false;
	is_gravatar_domain: boolean;
}

export interface ReceiptData {
	receiptId: string;
	displayPrice: string;
	currency: string;
	priceFloat: number;
	priceInteger: number;
	purchases: ReceiptPurchase[];
	failedPurchases: FailedReceiptPurchase[];
	isGravatarDomain: boolean;
}

export interface ReceiptState {
	data: null | ReceiptData;
	error: null | string;
	hasLoadedFromServer: boolean;
	isRequesting: boolean;
}
