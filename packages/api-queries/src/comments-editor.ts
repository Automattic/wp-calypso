import { fetchCommentsEditorSettings, fetchSiteCommentsBlocks } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

const ONE_HOUR_MS = 60 * 60 * 1000;

export const commentsEditorQuery = () =>
	queryOptions( {
		queryKey: [ 'comments', 'editor' ],
		queryFn: fetchCommentsEditorSettings,
		staleTime: ONE_HOUR_MS,
	} );

export const siteCommentsBlocksQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'comments', 'blocks' ],
		queryFn: () => fetchSiteCommentsBlocks( siteId ),
		staleTime: ONE_HOUR_MS,
		// A 404 means wpcom doesn't have the route yet, which retrying won't change.
		retry: false,
	} );
