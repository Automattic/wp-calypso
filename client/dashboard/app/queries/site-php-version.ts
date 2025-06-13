import { fetchPHPVersion, updatePHPVersion } from '../../data/site-hosting';
import { queryClient } from '../query-client';

export const sitePHPVersionQuery = ( siteId: number ) => ( {
	queryKey: [ 'site', siteId, 'php-version' ],
	queryFn: () => fetchPHPVersion( siteId ),
} );

export const sitePHPVersionMutation = ( siteId: number ) => ( {
	mutationFn: ( version: string ) => updatePHPVersion( siteId, version ),
	onSuccess: () => {
		queryClient.invalidateQueries( sitePHPVersionQuery( siteId ) );
	},
} );
