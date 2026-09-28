import { fetchSitePlanChangeFeatures } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const sitePlanChangeFeaturesQuery = ( siteId: number, targetProductSlug: string ) =>
	queryOptions( {
		queryKey: [ 'sites', siteId, 'plan-change-features', targetProductSlug ],
		queryFn: () => fetchSitePlanChangeFeatures( siteId, targetProductSlug ),
	} );
