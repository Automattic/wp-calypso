import { fetchWordPressVersion, updateWordPressVersion } from '../../data/site-hosting';
import { queryClient } from '../query-client';

export const siteWordPressVersionQuery = ( siteId: number ) => ( {
	queryKey: [ 'site', siteId, 'wp-version' ],
	queryFn: () => fetchWordPressVersion( siteId ),
} );

export const siteWordPressVersionMutation = ( siteId: number ) => ( {
	mutationFn: ( version: string ) => updateWordPressVersion( siteId, version ),
	onSuccess: () => {
		queryClient.invalidateQueries( siteWordPressVersionQuery( siteId ) );
	},
} );
