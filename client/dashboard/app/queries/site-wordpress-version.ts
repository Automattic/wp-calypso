import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { fetchWordPressVersion, updateWordPressVersion } from '../../data/site-hosting';
import { queryClient } from '../query-client';

export const siteWordPressVersionQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'wp-version' ],
		queryFn: () => fetchWordPressVersion( siteId ),
	} );

export const siteWordPressVersionMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( version: string ) => updateWordPressVersion( siteId, version ),
		onSuccess: () => {
			queryClient.invalidateQueries( siteWordPressVersionQuery( siteId ) );
		},
	} );
