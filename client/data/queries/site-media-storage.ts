import { fetchSiteMediaStorage } from '../api/site-media-storage';

export const siteMediaStorageQuery = ( siteId: number ) => ( {
	queryKey: [ 'site', siteId, 'media-storage' ],
	queryFn: () => fetchSiteMediaStorage( siteId ),
} );
