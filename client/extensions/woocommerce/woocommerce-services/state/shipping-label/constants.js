// "Countries" from when USPS can ship a package. That is, the countries or territories with at least 1 USPS post office
export const ACCEPTED_USPS_ORIGIN_COUNTRIES = [
	'US', // United States
	'PR', // Puerto Rico
	'VI', // Virgin Islands
	'GU', // Guam
	'AS', // American Samoa
	'UM', // United States Minor Outlying Islands
	'MH', // Marshall Islands
	'FM', // Micronesia
	'MP', // Northern Mariana Islands
];

// Packages shipping to or from the US, Puerto Rico and Virgin Islands don't need a Customs form
export const DOMESTIC_US_TERRITORIES = [ 'US', 'PR', 'VI' ];

// These US states are a special case because they represent military bases. They're considered "domestic",
// but they require a Customs form to ship from/to them.
export const US_MILITARY_STATES = [ 'AA', 'AE', 'AP' ];
