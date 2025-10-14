import { Domain, EmailProvider } from '@automattic/api-core';
import { hasGSuiteWithUs, hasTitanMailWithUs } from '../../utils/domain';

export type IntroductoryOfferTimeUnit = 'day' | 'week' | 'month' | 'year';

export interface ProductIntroductoryOffer {
	cost_per_interval: number;
	interval_count: number;
	interval_unit: IntroductoryOfferTimeUnit;
	should_prorate_when_offer_ends: boolean;
	transition_after_renewal_count: number;
	usage_limit: number | null;
}

export interface PriceTierEntry {
	minimum_units: number;
	maximum_units?: undefined | null | number;
	minimum_price: number;
	minimum_price_display: string;
	minimum_price_monthly_display?: string | null | undefined;
	maximum_price: number;
	maximum_price_display?: string | null | undefined;
	maximum_price_monthly_display?: string | null | undefined;
	/**
	 * If set, is used to transform the usage/quantity of units used to derive the number of units
	 * we want to bill the customer for, before multiplying by the per_unit_fee.
	 *
	 * To put simply, the purpose of this attribute is to bill the customer at a different granularity compared to their usage.
	 */
	transform_quantity_divide_by?: number | null | undefined;
	/**
	 * Used for rounding the number of units we want to bill the customer for (which is derived after dividing the
	 * usage/quantity of units by the `transform_quantity_divide_by` number).
	 *
	 * Used only when `transform_quantity_divide_by` is set. Possible values are: `up`, `down`
	 */
	transform_quantity_round?: string | null | undefined;
	/**
	 * The amount in the currency's smallest unit that this tier costs per unit.
	 */
	per_unit_fee?: number | null | undefined;
	/**
	 * The amount in the currency's smallest unit that this tier costs as a flat fee (for the entire tier).
	 */
	flat_fee?: number | null | undefined;
}

export interface ProductListItem {
	product_id: number;
	product_name: string;
	product_slug: string;
	description: string;
	product_type: string;
	available: boolean;
	is_domain_registration: boolean;
	cost_display: string;
	cost: number;
	cost_smallest_unit: number;
	currency_code: string;
	introductory_offer?: ProductIntroductoryOffer;
	price_tier_list: PriceTierEntry[];
	price_tier_usage_quantity: null | number;
	price_tier_slug: string;
	sale_coupon?: {
		discount?: number;
		allowed_for_domain_transfers?: boolean;
		start_date?: string;
		expires?: string;
	};
	sale_cost?: number;
	is_privacy_protection_product_purchase_allowed?: boolean;
	product_term?: string;
	billing_product_slug: string;
}

type EmailProperties = {
	existingItemsCount: number;
	isAdditionalMailboxesPurchase: boolean;
	emailProduct: ProductListItem;
	newQuantity: number | undefined;
	quantity: number;
};

/**
 * Returns the maximum number of mailboxes that can be provisioned for a domain. Because a Titan
 * subscription must have at least one mailbox, `1` is the default return value even for domains
 * without an active Titan subscription.
 */
export function getMaxTitanMailboxCount( domain: Domain ): number {
	// @ts-ignore - TODO: check the difference between Domain and ResponseDomain
	return domain.titan_mail_subscription?.maximum_mailbox_count ?? 1;
}

export function getGSuiteMailboxCount( domain: Domain ): number {
	// @ts-ignore - TODO: check the difference between Domain and ResponseDomain
	return domain?.google_apps_subscription?.total_user_count ?? 0;
}

export const getEmailProductProperties = (
	provider: EmailProvider,
	domain: Domain,
	emailProduct: ProductListItem,
	newMailboxesCount = 1
): EmailProperties => {
	const isTitanProvider = provider === 'titan';
	const isAdditionalMailboxesPurchase = isTitanProvider
		? hasTitanMailWithUs( domain )
		: hasGSuiteWithUs( domain );

	const existingItemsCount = isTitanProvider
		? getMaxTitanMailboxCount( domain )
		: getGSuiteMailboxCount( domain );

	const quantity = isAdditionalMailboxesPurchase
		? existingItemsCount + newMailboxesCount
		: newMailboxesCount;

	return {
		existingItemsCount,
		isAdditionalMailboxesPurchase,
		emailProduct,
		newQuantity: newMailboxesCount,
		quantity,
	};
};
