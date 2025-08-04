import { queryOptions } from '@tanstack/react-query';
import { fetchSiteMediaStorage } from '../../data/site-media-storage';

export const siteMediaStorageQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'media-storage' ],
		queryFn: () => fetchSiteMediaStorage( siteId ),
	} );
