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
