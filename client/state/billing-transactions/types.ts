import type { IntroductoryOfferTerms } from '@automattic/shopping-cart';
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
	cc_display_brand: string | null;
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
	service_slug: string;

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
	 * The receipt item's total before taxes in a locale and currency formatted
	 * string.
	 * @deprecated use subtotal_integer
	 */
	subtotal: string;

	/**
	 * The receipt item's total before taxes in the currency's standard unit as
	 * a decimal, floating point number.
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
	 * The receipt item's total as a locale and currency formatted string.
	 * @deprecated use amount_integer
	 */
	amount: string;

	/**
	 * The receipt item's total in the currency's standard unit as a decimal,
	 * floating point number.
	 * @deprecated use amount_integer
	 */
	raw_amount: number;

	/**
	 * The receipt item's total in the currency's smallest unit.
	 */
	amount_integer: number;

	/**
	 * Every price change that was made to this receipt item. Only exists for
	 * receipt items made after October 2023.
	 */
	cost_overrides: ReceiptCostOverride[];

	/**
	 * The details of any introductory offer that was applied to this receipt,
	 * assuming we have that data stored. Will only be available for receipts
	 * made after `cost_overrides` became available on receipt items and after
	 * we began using cost overrides for introductory offers in D134600-code
	 * (February 2024).
	 */
	introductory_offer_terms?: IntroductoryOfferTerms;

	currency: string;
	licensed_quantity: number | null;
	new_quantity: number | null;
	volume: number | null;
	product: string;
	product_slug: string;
	variation: string;
	variation_slug: string;
	months_per_renewal_interval: number;
	wpcom_product_slug: string;

	/**
	 * Slug for price tier, available only if product supports usage-based tiered pricing.
	 * See D40809-code for details.
	 */
	price_tier_slug: string | null;
}

export interface ReceiptCostOverride {
	id: string;
	human_readable_reason: string;
	override_code: string;

	/**
	 * If this is true, the override is not a discount but a reset for the base
	 * price of the product.
	 */
	does_override_original_cost: boolean;

	/**
	 * The price as it was before this price change was applied. It is a number
	 * in the curreny's smallest unit.
	 */
	old_price_integer: number;

	/**
	 * The price as it was after this price change was applied. It is a number
	 * in the currency's smallest unit.
	 */
	new_price_integer: number;
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
