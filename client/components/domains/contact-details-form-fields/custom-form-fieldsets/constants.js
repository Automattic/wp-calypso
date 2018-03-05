export const CHECKOUT_UK_ADDRESS_FORMAT_COUNTRY_CODES = [ 'GB', 'IE' ];

// We must exclude country codes that return
// a localized list of states from the backend:
// AU, BE, BR, CN, ES, IN, IT, JP, MX
export const CHECKOUT_EU_ADDRESS_FORMAT_COUNTRY_CODES = [
	'AR', 'AT', 'BA', 'BG', 'CH', 'CL', 'CZ', 'DE',
	'DK', 'EE', 'FI', 'FR', 'HU', 'IS', 'IL', 'LU', 'MC',
	'NL', 'NO', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK', 'SV',
	'UY', 'VE',
];
