import { fetchWordPressPrerelease } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

// Nested under the `wp-version` key, so invalidating the site's version after a switch refetches it too.
export const siteWordPressPrereleaseQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'wp-version', 'prerelease' ],
		queryFn: () => fetchWordPressPrerelease( siteId ),
	} );
