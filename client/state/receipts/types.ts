export interface RawReceiptPurchase {
	delayed_provisioning?: boolean;
	free_trial?: boolean;
	is_domain_registration?: boolean;
	meta: string;
	product_id: string | number;
	product_slug: string;
	product_type: string;
	product_name: string;
	product_name_short: string;
	new_quantity: number;
	registrar_support_url?: string;
	is_email_verified?: boolean;
	is_root_domain_with_us?: boolean;
	is_renewal?: boolean;
	will_auto_renew?: boolean;
}

export interface RawFailedReceiptPurchase {
	product_meta: string;
	product_id: string | number;
	product_slug: string;
	product_cost: string | number;
	product_name: string;
}

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
	isRenewal: boolean;
	willAutoRenew: boolean;
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

	/**
	 * Will only be an array if it is empty.
	 */
	purchases: RawReceiptPurchases | Array< void >;

	/**
	 * Will only be an array if it is empty.
	 */
	failed_purchases: RawFailedReceiptPurchases | Array< void >;
}

export type RawFailedReceiptPurchases = Record< string, RawFailedReceiptPurchase[] >;

export type RawReceiptPurchases = Record< string, RawReceiptPurchase[] >;

export interface ReceiptData {
	receiptId: string;
	displayPrice: string;
	currency: string;
	priceFloat: number;
	priceInteger: number;
	purchases: ReceiptPurchase[];
	failedPurchases: FailedReceiptPurchase[];
}
