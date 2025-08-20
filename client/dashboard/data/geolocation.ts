export interface GeoLocationData {
	city: string;
	country_long: string;
	country_short: string;
	latitude: string;
	longitude: string;
	region: string;
}

export function fetchGeoLocation(): Promise< GeoLocationData > {
	return fetch( 'https://public-api.wordpress.com/geo/' ).then( ( response ) => response.json() );
}
