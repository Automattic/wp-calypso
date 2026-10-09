import { prepareComparableUrl, type ReadSiteResponse } from '@automattic/api-core';
import {
	getIsSubscribedFromData,
	getSiteSubscriptionsQueryKey,
	readSiteQuery,
	type SiteSubscriptionsInfiniteData,
} from '@automattic/api-queries';
import type { QueryClient } from '@tanstack/react-query';

const FOLLOW_SENSITIVE_QUERY_KEYS = [
	getSiteSubscriptionsQueryKey(),
	[ 'read', 'stream', 'following' ],
	[ 'read', 'stream', 'infinite', 'following' ],
	[ 'read', 'subscriptions-count' ],
] as const;

const getNumericId = ( id: number | string ): number | undefined => {
	const numericId = typeof id === 'string' ? Number( id ) : id;

	return typeof numericId === 'number' && Number.isFinite( numericId ) && numericId > 0
		? numericId
		: undefined;
};

/**
 * Whether every subscription is cached. The list loads a page at a time and
 * stops at 2,000 rows, so a blog missing from a partial list may still be
 * followed. Mirrors the query's next-page check: the pages must cover the
 * server's total, or end on an empty page when there's no total.
 */
const hasAllSiteSubscriptions = ( data: SiteSubscriptionsInfiniteData ): boolean => {
	const totalCount = data.pages.find( ( page ) => typeof page.totalCount === 'number' )?.totalCount;
	if ( typeof totalCount !== 'number' ) {
		return data.pages[ data.pages.length - 1 ]?.subscriptions.length === 0;
	}

	return data.pages.reduce( ( rows, page ) => rows + page.number, 0 ) >= totalCount;
};

/**
 * Whether the user follows a post's blog or feed, read from the cached
 * subscriptions. A match means true at any point; false needs the whole list
 * cached. Otherwise undefined, so tracking reports "unknown" rather than a
 * wrong "not following".
 */
export const getCachedIsFollowingPost = (
	queryClient: QueryClient | null,
	post: { site_ID?: number; feed_ID?: number; is_external?: boolean }
): boolean | undefined => {
	const data = queryClient?.getQueryData< SiteSubscriptionsInfiniteData >(
		getSiteSubscriptionsQueryKey()
	);
	const blogId = ! post.is_external && post.site_ID ? getNumericId( post.site_ID ) : undefined;
	const feedId = post.feed_ID ? getNumericId( post.feed_ID ) : undefined;
	if ( ! data || ( ! blogId && ! feedId ) ) {
		return undefined;
	}

	if ( getIsSubscribedFromData( data, { blogId, feedId } ) ) {
		return true;
	}

	return hasAllSiteSubscriptions( data ) ? false : undefined;
};

export const patchReadSiteFollowStatus = (
	queryClient: QueryClient,
	feedUrl: string,
	isFollowing: boolean
) => {
	const comparableFeedUrl = prepareComparableUrl( feedUrl );
	if ( ! comparableFeedUrl ) {
		return;
	}

	for ( const [ queryKey, site ] of queryClient.getQueriesData< ReadSiteResponse >( {
		queryKey: [ 'read', 'sites' ],
	} ) ) {
		if ( site && prepareComparableUrl( site.feed_URL ) === comparableFeedUrl ) {
			queryClient.setQueryData< ReadSiteResponse >( queryKey, {
				...site,
				is_following: isFollowing,
			} );
		}
	}
};

export const patchReadSiteFollowStatusByBlogId = (
	queryClient: QueryClient,
	blogId: number | string,
	isFollowing: boolean
) => {
	const numericId = getNumericId( blogId );
	if ( ! numericId ) {
		return;
	}

	queryClient.setQueryData< ReadSiteResponse >( readSiteQuery( numericId ).queryKey, ( site ) =>
		site ? { ...site, is_following: isFollowing } : site
	);
};

export const invalidateFollowSensitiveCaches = ( queryClient: QueryClient ) =>
	Promise.all(
		FOLLOW_SENSITIVE_QUERY_KEYS.map( ( queryKey ) => queryClient.invalidateQueries( { queryKey } ) )
	);
