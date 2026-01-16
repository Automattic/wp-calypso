export interface APIProductFamilyProductBundlePrice {
	quantity: number;
	amount: string;
	price_per_unit: number; // price per day in cents
}

export interface APIProductFamilyProduct {
	name: string;
	slug: string;
	product_id: number;
	monthly_product_id?: number;
	yearly_product_id?: number;
	alternative_product_id?: number;
	monthly_alternative_product_id?: number;
	yearly_alternative_product_id?: number;
	currency: string;
	amount: string;
	price_interval: string;
	price_per_unit?: number; // price per day in cents
	price_per_unit_display?: string;
	family_slug: string;
	supported_bundles: APIProductFamilyProductBundlePrice[];
	monthly_price?: number;
	yearly_price?: number;
}

export interface APIProductFamily {
	name: string;
	slug: string;
	products: APIProductFamilyProduct[];
	discounts?: {
		tiers: {
			quantity: number;
			discount_percent: number;
		}[];
	};
}

export type SelectedLicenseProp = APIProductFamilyProduct & {
	quantity: number;
	siteUrls?: string[];
};
