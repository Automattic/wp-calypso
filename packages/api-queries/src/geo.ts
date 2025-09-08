import { fetchGeo } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const geoLocationQuery = () =>
	queryOptions( {
		queryKey: [ 'geolocation' ],
		queryFn: () => fetchGeo(),
	} );
