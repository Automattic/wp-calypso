import { fetchSiteFeatures } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const siteFeaturesQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'features' ],
		queryFn: () => fetchSiteFeatures( siteId ),
	} );
