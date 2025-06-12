import { fetchSiteMediaStorage } from '../../data/site-media-storage';

export const siteMediaStorageQuery = ( siteId: number ) => ( {
	queryKey: [ 'site', siteId, 'media-storage' ],
	queryFn: () => fetchSiteMediaStorage( siteId ),
} );
