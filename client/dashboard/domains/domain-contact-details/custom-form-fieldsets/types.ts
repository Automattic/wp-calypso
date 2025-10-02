export const CONTACT_DETAILS_FORM_FIELDS = [
	'firstName',
	'lastName',
	'organization',
	'email',
	'phone',
	'address1',
	'address2',
	'city',
	'state',
	'postalCode',
	'countryCode',
	'fax',
];

export const CHECKOUT_UK_ADDRESS_FORMAT_COUNTRY_CODES = [ 'GB', 'IE' ];

// We must exclude country codes that return
// a localized list of states from the backend:
// AU, BE, BR, CN, ES, IN, IT, JP, MX
export const CHECKOUT_EU_ADDRESS_FORMAT_COUNTRY_CODES = [
	'AR',
	'AT',
	'BA',
	'BG',
	'CH',
	'CL',
	'CZ',
	'DE',
	'DK',
	'EE',
	'ES',
	'FI',
	'FR',
	'HU',
	'IS',
	'IL',
	'LU',
	'MC',
	'NL',
	'NO',
	'PL',
	'PT',
	'RO',
	'SE',
	'SI',
	'SK',
	'SV',
	'UY',
	'VE',
];

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
