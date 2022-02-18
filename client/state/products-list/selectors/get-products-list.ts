import type { PriceTierEntry } from '@automattic/calypso-products';
import type { AppState } from 'calypso/types';
import 'calypso/state/products-list/init';

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
}

export function getProductsList( state: AppState ): Record< string, ProductListItem > {
	return state.productsList.items;
}
