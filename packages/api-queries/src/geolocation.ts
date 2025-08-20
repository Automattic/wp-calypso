import { queryOptions } from '@tanstack/react-query';
import { fetchGeoLocation } from '../../data/geolocation';

export const geoLocationQuery = () =>
	queryOptions( {
		queryFn: () => fetchGeoLocation(),
	} );
