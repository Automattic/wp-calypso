import { useQuery } from '@tanstack/react-query';

export interface GeoLocationData {
	city: string;
	country_long: string;
	country_short: string;
	latitude: string;
	longitude: string;
	region: string;
}

export const useGeoLocationQuery = ( options = {} ) =>
	useQuery< GeoLocationData >( {
		queryKey: [ 'geo' ],
		queryFn: () =>
			globalThis
				.fetch( 'https://public-api.wordpress.com/geo/' )
				.then( ( response ) => response.json() ),
		...options,
	} );
