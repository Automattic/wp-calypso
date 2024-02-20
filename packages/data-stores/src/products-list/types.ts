import * as actions from './actions';
import type { DispatchFromMap } from '../mapped-types';
import type {
	PriceTierEntry,
	ProductSlug,
	SpaceUpgradeProductSlug,
} from '@automattic/calypso-products';

export interface Dispatch {
	dispatch: DispatchFromMap< typeof actions >;
}

export interface ProductPriceTier {
	minimumUnits: number;
	maximumUnits?: undefined | null | number;
	minimumPrice: number;
	maximumPrice: number;
	minimumPriceDisplay: string;
	maximumPriceDisplay?: string | null | undefined;
}

export interface Product {
	costSmallestUnit: number;
	currencyCode: string;
	description: string;
	priceTierList: ProductPriceTier[];
	productName: string;
	productSlug: ProductSlug;
	productTerm?: string;
}

export interface APIProductsListItem {
	available: boolean;
	combined_cost_display: string;
	cost: number;
	cost_smallest_unit: number;
	currency_code: string;
	description: string;
	is_domain_registration: boolean;
	price_tier_list: PriceTierEntry[];
	price_tier_slug: string;
	price_tier_usage_quantity: number | null;
	price_tiers: any;
	product_id: number;
	product_name: string;
	product_slug: ProductSlug | SpaceUpgradeProductSlug;
	product_term?: string;
	product_type: string;
}

export type APIProductsList = Record< string, APIProductsListItem >;

export interface ProductsListFailure {
	message: string;
}
