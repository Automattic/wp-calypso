import { fetchP2HubP2s } from '../api/p2';

export const p2HubP2sQuery = ( siteId: number, options: { limit?: number } = {} ) => ( {
	queryKey: [ 'p2-hub', siteId, 'p2s', options ],
	queryFn: () => fetchP2HubP2s( siteId, options ),
} );
