import * as actions from './actions';
import type { DispatchFromMap } from '../mapped-types';
import type {
	PriceTierEntry,
	ProductSlug,
	WPComOtherProductSlug,
	WPComSpaceUpgradeProductSlug,
} from '@automattic/calypso-products';

export interface Dispatch {
	dispatch: DispatchFromMap< typeof actions >;
}

export type StoreProductSlug = ProductSlug | WPComSpaceUpgradeProductSlug | WPComOtherProductSlug;

export interface ProductPriceTier {
	minimumUnits: number;
	maximumUnits?: undefined | null | number;
	minimumPrice: number;
	maximumPrice: number;
	minimumPriceDisplay: string;
	maximumPriceDisplay?: string | null | undefined;
}

/**
 * Product data as transformed for the UI
 * - Only properties needed by the UI are included (which can gradually be expanded as needed)
 */
export interface Product {
	id: number;
	name: string;
	term?: string;
	description: string;
	productSlug: StoreProductSlug;
	costSmallestUnit: number;
	currencyCode: string;
	priceTierList: ProductPriceTier[];
}

/**
 * Product data as returned by the API
 */
export interface RawAPIProduct {
	available: boolean;
	combined_cost_display: string;
	cost: number;
	cost_per_month_display?: string;
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
	product_slug: StoreProductSlug;
	product_term?: string;
	product_type: string;
}

export type RawAPIProductsList = Record< string, RawAPIProduct >;

export interface ProductsListFailure {
	message: string;
}
