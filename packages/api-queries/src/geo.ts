import { queryOptions } from '@tanstack/react-query';
import { fetchGeo } from '../../data/geo';

export const geoLocationQuery = () =>
	queryOptions( {
		queryKey: [ 'geolocation' ],
		queryFn: () => fetchGeo(),
	} );
