import { useQuery } from 'react-query';

export interface GeoLocationData {
	city: string;
	country_long: string;
	country_short: string;
	latitude: string;
	longitude: string;
	region: string;
}

export const useGeoLocationQuery = () =>
	useQuery< GeoLocationData >( 'geo', () =>
		globalThis
			.fetch( 'https://public-api.wordpress.com/geo/' )
			.then( ( response ) => response.json() )
	);
