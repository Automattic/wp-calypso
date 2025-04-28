import { type UseQueryOptions } from '@tanstack/react-query';
import { useSelector } from 'calypso/state';
import { getCurrentUserCountryCode } from 'calypso/state/current-user/selectors';
import { useGeoLocationQuery, type GeoLocationData } from './use-geolocation-query';

export function useCountryCodeQuery( options: Partial< UseQueryOptions< GeoLocationData > > = {} ) {
	const currentUserCountryCode = useSelector( getCurrentUserCountryCode );
	const { data: geoData } = useGeoLocationQuery( {
		enabled: ! currentUserCountryCode,
		...options,
	} );

	return currentUserCountryCode ?? geoData?.country_short;
}
