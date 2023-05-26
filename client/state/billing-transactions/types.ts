import type { Purchase, TaxVendorInfo } from '@automattic/wpcom-checkout';

export interface IndividualReceipt {
	receipt_id: number;
	purchases: Purchase[];
	display_price: string;
	price_integer: number;
	price_float: number;
	currency: string;
	is_gift_purchase: boolean;
}

export interface BillingTransaction {
	address: string;

	/**
	 * @deprecated use amount_integer
	 */
	amount: string;

	/**
	 * The receipt's total in the currency's smallest unit.
	 */
	amount_integer: number;

	currency: string;

	tax_country_code: string;
	tax_external_id?: string;
	cc_email: string;
	cc_name: string;
	cc_num: string;
	cc_type: string;
	credit: string;
	date: string;
	desc: string;
	icon: string;
	id: string;
	items: BillingTransactionItem[];
	org: string;
	pay_part: string;
	pay_ref: string;
	service: string;

	/**
	 * @deprecated use subtotal_integer
	 */
	subtotal: string;

	/**
	 * The receipt's total before taxes in the currency's smallest unit.
	 */
	subtotal_integer: number;

	support: string;

	/**
	 * @deprecated use tax_integer
	 */
	tax: string;

	/**
	 * The receipt's total taxes in the currency's smallest unit.
	 */
	tax_integer: number;

	url: string;

	tax_vendor_info?: TaxVendorInfo;
}

export interface BillingTransactionItem {
	id: string;
	type: string;
	type_localized: string;
	domain: string;
	site_id: string;

	/**
	 * @deprecated use subtotal_integer
	 */
	subtotal: string;

	/**
	 * @deprecated use subtotal_integer
	 */
	raw_subtotal: number;

	/**
	 * The receipt item's total before taxes in the currency's smallest unit.
	 */
	subtotal_integer: number;

	/**
	 * @deprecated use tax_integer
	 */
	tax: string;

	/**
	 * @deprecated use tax_integer
	 */
	raw_tax: number;

	/**
	 * The receipt item's total taxes in the currency's smallest unit.
	 */
	tax_integer: number;

	/**
	 * @deprecated use amount_integer
	 */
	amount: string;

	/**
	 * @deprecated use amount_integer
	 */
	raw_amount: number;

	/**
	 * The receipt item's total in the currency's smallest unit.
	 */
	amount_integer: number;

	currency: string;
	licensed_quantity: number | null;
	new_quantity: number | null;
	product: string;
	product_slug: string;
	variation: string;
	variation_slug: string;
	months_per_renewal_interval: number;
	wpcom_product_slug: string;
}

export interface UpcomingCharge {
	amount: string;
	blog_id: string;
	date: string;
	domain: string | null;
	icon: string;
	id: string;
	interval: string;
	plan: string;
	product: string;
	wpcom_product_slug: string;
}

export type ReceiptId = string;
export type SendingReceiptEmailRecord = Record< ReceiptId, boolean >;

export interface BillingTransactionUiState {
	app?: string | null;
	date?: { month: string | null; operator: string | null };
	page?: number;
	query?: string;
}

export type BillingTransactionsTypePast = 'past';
export type BillingTransactionsTypeUpcoming = 'upcoming';
export type BillingTransactionsType = BillingTransactionsTypePast | BillingTransactionsTypeUpcoming;

export interface BillingTransactionsStateItems {
	past?: BillingTransaction[];
	upcoming?: UpcomingCharge[];
}

export type IndividualTransactionsRecord = Record< ReceiptId, IndividualTransactionsState >;

export interface IndividualTransactionsState {
	requesting: boolean;
	error: boolean;
	data: BillingTransaction;
}

export interface BillingTransactionsState {
	items?: BillingTransactionsStateItems;
	requesting?: boolean;
	sendingReceiptEmail?: SendingReceiptEmailRecord;
	individualTransactions?: IndividualTransactionsRecord;
	ui?: Record< BillingTransactionsType, BillingTransactionUiState >;
}
