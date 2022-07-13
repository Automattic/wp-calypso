import type { PriceTierEntry } from '@automattic/calypso-products';
import type { AppState } from 'calypso/types';
import 'calypso/state/products-list/init';

export type IntroductoryOfferTimeUnit = 'day' | 'week' | 'month' | 'year';

export interface ProductIntroductoryOffer {
	cost_per_interval: number;
	interval_count: number;
	interval_unit: IntroductoryOfferTimeUnit;
	should_prorate_when_offer_ends: boolean;
	transition_after_renewal_count: number;
	usage_limit: number | null;
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
	item_original_cost_for_quantity_one_display: string; // without discounts or volume, and quantity 1
}

export function getProductsList( state: AppState ): Record< string, ProductListItem > {
	return state.productsList.items;
}
