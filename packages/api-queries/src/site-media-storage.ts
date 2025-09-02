import { fetchSiteMediaStorage } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const siteMediaStorageQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'media-storage' ],
		queryFn: () => fetchSiteMediaStorage( siteId ),
	} );
