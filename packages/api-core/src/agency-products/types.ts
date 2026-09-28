export interface AgencyProductTierPrice {
	units: number;
	price: number;
}

/** Plan limits the Pressable products carry; only the fields the dashboard reads. */
export interface AgencyProductMetadata {
	sites: number;
	visits: number;
	storage: number;
	php_worker_count: number;
	category: string;
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
	monthly_price?: number;
	yearly_price?: number;
	monthly_introductory_price?: number;
	yearly_introductory_price?: number;
	tier_monthly_prices?: AgencyProductTierPrice[];
	tier_yearly_prices?: AgencyProductTierPrice[];
	metadata?: AgencyProductMetadata;
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
