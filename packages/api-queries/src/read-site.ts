import { adaptReadSite, fetchReadSite } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const readSiteQuery = ( siteId?: number | string ) => {
	const coercedId = typeof siteId === 'string' ? Number( siteId ) : siteId;
	const id = typeof coercedId === 'number' && Number.isFinite( coercedId ) ? coercedId : undefined;

	return queryOptions( {
		queryKey: [ 'read', 'sites', id ?? 'invalid' ],
		queryFn: () => fetchReadSite( id! ),
		select: adaptReadSite,
		staleTime: ONE_DAY_MS,
		retry: false,
		retryOnMount: false,
		enabled: typeof id === 'number' && id > 0,
	} );
};
