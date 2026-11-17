import { fetchPHPVersion, fetchSiteEnvironmentInfo, updatePHPVersion } from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';

export const sitePHPVersionQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'php-version' ],
		queryFn: () => fetchPHPVersion( siteId ),
	} );

export const siteEnvironmentPHPVersionQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'environment-php-version' ],
		queryFn: async () => {
			const { php_version } = await fetchSiteEnvironmentInfo( siteId );
			return php_version.split( '.' ).slice( 0, 2 ).join( '.' );
		},
	} );

export const sitePHPVersionMutation = ( siteId: number ) =>
	mutationOptions( {
		meta: { statId: 'site-php-version-update' },
		mutationFn: ( version: string ) => updatePHPVersion( siteId, version ),
		onSuccess: () => {
			queryClient.invalidateQueries( sitePHPVersionQuery( siteId ) );
		},
	} );
