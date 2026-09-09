export interface AgencyProductBundle {
	quantity: number;
	amount: string;
	/** Price per day, in cents. */
	price_per_unit: number;
}

export interface AgencyProductTierPrice {
	units: number;
	price: number;
}

export interface AgencyProduct {
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
	/** Price per day, in cents. */
	price_per_unit?: number;
	price_per_unit_display?: string;
	monthly_price?: number;
	yearly_price?: number;
	monthly_introductory_price?: number;
	yearly_introductory_price?: number;
	tier_monthly_prices?: AgencyProductTierPrice[];
	tier_yearly_prices?: AgencyProductTierPrice[];
	supported_bundles?: AgencyProductBundle[];
	site_domain?: string;
	/** Not in the API response — added client-side from the parent family. */
	family_slug: string;
}

export interface AgencyProductFamily {
	name: string;
	slug: string;
	products: Omit< AgencyProduct, 'family_slug' >[];
	discounts?: {
		tiers: { quantity: number; discount_percent: number }[];
	};
}
