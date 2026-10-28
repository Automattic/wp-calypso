import { fetchWordPressPrerelease, updateWordPressPrerelease } from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';

// Nested under the `wp-version` key, so invalidating the site's version after a switch refetches it too.
export const siteWordPressPrereleaseQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'wp-version', 'prerelease' ],
		queryFn: () => fetchWordPressPrerelease( siteId ),
	} );

export const siteWordPressPrereleaseMutation = ( siteId: number ) =>
	mutationOptions( {
		meta: { statId: 'site-wp-prerelease-update' },
		mutationFn: ( optedOut: boolean ) => updateWordPressPrerelease( siteId, optedOut ),
		onSuccess: ( prerelease ) => {
			queryClient.setQueryData( siteWordPressPrereleaseQuery( siteId ).queryKey, prerelease );
		},
	} );
