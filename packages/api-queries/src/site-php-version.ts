import { fetchPHPVersion, updatePHPVersion } from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';

export const sitePHPVersionQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'php-version' ],
		queryFn: () => fetchPHPVersion( siteId ),
	} );

export const sitePHPVersionMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( version: string ) => updatePHPVersion( siteId, version ),
		onSuccess: () => {
			queryClient.invalidateQueries( sitePHPVersionQuery( siteId ) );
		},
	} );
