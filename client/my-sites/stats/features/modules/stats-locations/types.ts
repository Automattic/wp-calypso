export const OPTION_KEYS = {
	COUNTRIES: 'countries',
	REGIONS: 'regions',
	CITIES: 'cities',
};

export type GeoMode = 'country' | 'region' | 'city';
export type UrlGeoMode = ( typeof OPTION_KEYS )[ keyof typeof OPTION_KEYS ];

export const GEO_MODES: Record< UrlGeoMode, GeoMode > = {
	[ OPTION_KEYS.COUNTRIES ]: 'country',
	[ OPTION_KEYS.REGIONS ]: 'region',
	[ OPTION_KEYS.CITIES ]: 'city',
};
