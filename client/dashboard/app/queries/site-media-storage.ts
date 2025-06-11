import { fetchSiteMediaStorage } from '../../data/site-media-storage';

export const siteMediaStorageQuery = ( siteId: string ) => ( {
	queryKey: [ 'site', siteId, 'media-storage' ],
	queryFn: () => fetchSiteMediaStorage( siteId ),
} );
