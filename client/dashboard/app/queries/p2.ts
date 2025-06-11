import { fetchP2HubP2s } from '../../data/p2';

export const p2HubP2sQuery = ( siteId: string, options: { limit?: number } = {} ) => ( {
	queryKey: [ 'p2-hub', siteId, 'p2s', options ],
	queryFn: () => fetchP2HubP2s( siteId, options ),
} );
