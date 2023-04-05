import type { RawReceiptPurchase } from 'calypso/state/receipts/types';

export interface IndividualReceipt {
	receipt_id: number;
	purchases: RawReceiptPurchase[];
	display_price: string;
	price_integer: number;
	price_float: number;
	currency: string;
	is_gift_purchase: boolean;
}

export interface BillingTransaction {
	address: string;
	amount: string;
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
	subtotal: string;
	support: string;
	tax: string;
	url: string;
}

export interface BillingTransactionItem {
	id: string;
	type: string;
	type_localized: string;
	domain: string;
	site_id: string;
	subtotal: string;
	tax: string;
	amount: string;
	raw_subtotal: number;
	raw_tax: number;
	raw_amount: number;
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
