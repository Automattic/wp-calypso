export interface BillingTransaction {
	id: string;
	service: string;
	amount: string;
	tax_amount: string;
	icon: string;
	date: string;
	desc: string;
	org: string;
	url: string;
	support: string;
	pay_ref: string;
	pay_part: string;
	cc_type: string;
	cc_num: string;
	cc_name: string;
	cc_email: string;
	credit: string;
	items: BillingTransactionItem[];
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

export type BillingTransactionsType = 'past' | 'upcoming';

export interface BillingTransactionsState {
	items?: { past?: BillingTransaction[]; upcoming?: UpcomingCharge[] };
	requesting?: boolean;
	sendingReceiptEmail?: SendingReceiptEmailRecord;
	individualTransactions?: unknown; // TODO: fill this in.
	ui?: Record< BillingTransactionsType, BillingTransactionUiState >;
}
