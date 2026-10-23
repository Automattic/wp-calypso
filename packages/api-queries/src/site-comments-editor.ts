import { fetchSiteCommentsEditorSettings } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

const ONE_HOUR_MS = 60 * 60 * 1000;

export const siteCommentsEditorQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', 'comments', 'editor', siteId ],
		queryFn: () => fetchSiteCommentsEditorSettings( siteId ),
		staleTime: ONE_HOUR_MS,
		// A 404 is the answer for a site without block comments, not a failure to retry.
		retry: false,
		retryOnMount: false,
		enabled: Number.isInteger( siteId ) && siteId > 0,
	} );
