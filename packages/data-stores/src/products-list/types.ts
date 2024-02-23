import * as actions from './actions';
import type { DispatchFromMap } from '../mapped-types';
import type { PriceTierEntry } from '@automattic/calypso-products';

export interface Dispatch {
	dispatch: DispatchFromMap< typeof actions >;
}

export interface ProductsListItem {
	available: boolean;
	combined_cost_display: string;
	cost: number;
	cost_smallest_unit: number;
	currency_code: string;
	description: string;
	is_domain_registration: boolean;
	price_tier_list: PriceTierEntry[];
	price_tier_lug: string;
	price_tier_usage_quantity: number | null;
	price_tiers: any;
	product_id: number;
	product_name: string;
	product_slug: string;
	product_term?: string;
	product_type: string;
}

export type ProductsList = Record< string, ProductsListItem >;

export interface ProductsListFailure {
	message: string;
}
