import * as actions from './actions';
import type { DispatchFromMap } from '../mapped-types';

export interface Dispatch {
	dispatch: DispatchFromMap< typeof actions >;
}

export type IntroductoryOfferTimeUnit = 'day' | 'week' | 'month' | 'year';

export interface ProductIntroductoryOffer {
	cost_per_interval: number;
	interval_count: number;
	interval_unit: IntroductoryOfferTimeUnit;
	should_prorate_when_offer_ends: boolean;
	transition_after_renewal_count: number;
	usage_limit: number | null;
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
