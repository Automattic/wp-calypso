import { adaptReadSite, fetchReadSite, fetchReadSitePosts } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';
import type { ReadStreamPost } from '@automattic/api-core';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const LATEST_POST_STALE_TIME = 30 * 60 * 1000;

export const readSiteQuery = ( siteId?: number | string ) => {
	const coercedId = typeof siteId === 'string' ? Number( siteId ) : siteId;
	const id = typeof coercedId === 'number' && Number.isFinite( coercedId ) ? coercedId : undefined;

	return queryOptions( {
		queryKey: [ 'read', 'sites', id ?? 'invalid' ],
		queryFn: () => fetchReadSite( id! ),
		select: adaptReadSite,
		staleTime: ONE_DAY_MS,
		retry: false,
		retryOnMount: false,
		enabled: typeof id === 'number' && id > 0,
	} );
};

export const readSiteLatestPostQueryKey = ( siteId?: number | string | null ) =>
	[ 'read', 'site-latest-post', Number( siteId ) ] as const;

/**
 * The newest post on a site, as a one-post page of `/read/sites/{siteId}/posts`.
 * Resolves to `null` when the site has no posts.
 */
export const readSiteLatestPostQuery = ( siteId?: number | string | null ) => {
	const id = Number( siteId );
	return queryOptions( {
		queryKey: readSiteLatestPostQueryKey( id ),
		staleTime: LATEST_POST_STALE_TIME,
		queryFn: async (): Promise< ReadStreamPost | null > => {
			const response = await fetchReadSitePosts( id, { number: 1 } );
			return response.posts?.[ 0 ] ?? null;
		},
		enabled: siteId != null && Number.isInteger( id ) && id > 0,
		meta: { persist: false },
	} );
};
