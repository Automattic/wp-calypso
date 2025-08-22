import wpcom from 'calypso/lib/wp';

export interface CountryListItemBase {
	code: string;
	name: string;
	has_postal_codes?: boolean;
	tax_needs_city?: boolean;
	tax_needs_subdivision?: boolean;
	tax_needs_organization?: boolean;
	tax_needs_address?: boolean;

	/**
	 * The localized name of the tax (eg: "VAT", "GST", etc.).
	 */
	tax_name?: string;
}
export interface CountryListItemWithoutVat extends CountryListItemBase {
	vat_supported: false;
}
export interface CountryListItemWithVat extends CountryListItemBase {
	vat_supported: true;
	tax_country_codes: string[];
}

export type CountryListItem = CountryListItemWithVat | CountryListItemWithoutVat;

export interface StatesListItem {
	code: string;
	name: string;
}

export async function fetchCountryList(): Promise< CountryListItem[] > {
	return await wpcom.req.get( {
		path: '/domains/supported-countries',
		apiVersion: '1.1',
	} );
}

export async function fetchStatesList( countryCode: string ): Promise< StatesListItem[] > {
	return await wpcom.req.get( {
		path: `/domains/supported-states/${ countryCode }`,
		apiVersion: '1.1',
	} );
}
