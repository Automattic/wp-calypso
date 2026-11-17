import {
	fetchWordPressVersion,
	fetchPendingWordPressVersion,
	fetchWordPressTrackVersions,
	fetchWpOrgCoreVersion,
	updateWordPressVersion,
} from '@automattic/api-core';
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';

export const siteWordPressVersionQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'wp-version' ],
		queryFn: () => fetchWordPressVersion( siteId ),
	} );

export const sitePendingWordPressVersionQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'wp-version', 'pending' ],
		queryFn: () => fetchPendingWordPressVersion( siteId ),
	} );

// WP Cloud's tracks can lag behind wordpress.org's releases, so ask the site what they serve.
// Sites that can't answer, like those on an older wpcomsh, fall back to wordpress.org's versions.
export const siteWordPressTrackVersionsQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'wp-track-versions' ],
		queryFn: async () => {
			const versions = await fetchWordPressTrackVersions( siteId ).catch( () => null );
			const [ latest, beta ] = await Promise.all( [
				versions?.latest ?? fetchWpOrgCoreVersion(),
				versions?.beta ?? fetchWpOrgCoreVersion( 'beta' ),
			] );
			return { latest, beta };
		},
	} );

export const siteWordPressVersionMutation = (
	siteId: number,
	options?: { deferUntilBackupComplete?: boolean }
) =>
	mutationOptions( {
		meta: { statId: 'site-wp-version-update' },
		mutationFn: ( version: string ) =>
			updateWordPressVersion( siteId, version, options?.deferUntilBackupComplete ),
		onSuccess: () => {
			queryClient.invalidateQueries( siteWordPressVersionQuery( siteId ) );
			queryClient.invalidateQueries( sitePendingWordPressVersionQuery( siteId ) );
		},
	} );
