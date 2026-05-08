import { adaptReadSite, fetchReadSite } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const readSiteQuery = ( siteId?: number | string ) => {
	const id = typeof siteId === 'string' ? Number( siteId ) : siteId;
	return queryOptions( {
		queryKey: [ 'read', 'sites', id ],
		queryFn: () => fetchReadSite( id! ),
		select: adaptReadSite,
		staleTime: ONE_DAY_MS,
		retry: false,
		enabled: typeof id === 'number' && id > 0,
	} );
};
