export interface TaxInfo {
	tax_postal_code: string;
	tax_country_code: string;
}

export interface TaxGetInfo extends TaxInfo {
	is_tax_info_set: boolean;
}
