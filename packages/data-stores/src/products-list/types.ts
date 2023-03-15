import * as actions from './actions';
import * as selectors from './selectors';
import type { DispatchFromMap, SelectFromMap } from '../mapped-types';

export type ProductsListSelect = SelectFromMap< typeof selectors >;

export interface Dispatch {
	dispatch: DispatchFromMap< typeof actions >;
}

export interface ProductsListItem {
	available: boolean;
	combined_cost_display: string;
	cost: number;
	currency_code: string;
	description: string;
	is_domain_registration: boolean;
	price_tier_list: any;
	price_tier_lug: string;
	price_tier_usage_quantity: number | null;
	price_tiers: any;
	product_id: number;
	product_name: string;
	product_slug: string;
	product_term: string;
	product_type: string;
}

export type ProductsList = Record< string, ProductsListItem >;

export interface ProductsListFailure {
	message: string;
}
