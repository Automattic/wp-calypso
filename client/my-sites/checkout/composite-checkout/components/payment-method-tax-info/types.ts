export interface TaxInfo {
	tax_postal_code: string;
	tax_country_code: string;
	tax_subdivision_code?: string;
	tax_city?: string;
	tax_organization?: string;
	tax_address?: string;
}

export interface TaxGetInfo extends TaxInfo {
	is_tax_info_set: boolean;
}
