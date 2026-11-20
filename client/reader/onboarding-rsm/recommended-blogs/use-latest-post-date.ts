import { readFeedLatestPostQuery, readSiteLatestPostQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import type { ReadStreamPost } from '@automattic/api-core';

// Allows for clock skew between the feed's server and the reader's device.
const FUTURE_TOLERANCE_MS = 1000 * 60 * 60 * 24;

/**
 * The published date of a blog's newest post, or `null` when the post is
 * missing or its date is unusable.
 */
export const getLatestPostDate = ( post?: ReadStreamPost | null ): Date | null => {
	if ( ! post?.date ) {
		return null;
	}
	const date = new Date( post.date );
	const time = date.getTime();
	if ( Number.isNaN( time ) || time > Date.now() + FUTURE_TOLERANCE_MS ) {
		return null;
	}
	return date;
};

type LatestPostDateOptions = {
	enabled?: boolean;
};

/**
 * Fetches a recommended blog's latest post date when `enabled`, e.g. once its
 * popover opens. Returns `null` while loading and when the lookup fails, so
 * callers show no date rather than a wrong one.
 *
 * Blogs with a site ID read the site's post stream, as the Reader's site pages
 * do; feed-only blogs (site ID 0) read the feed's.
 */
export const useLatestPostDate = (
	blog: { feed_ID?: number | null; site_ID?: number | null },
	options?: LatestPostDateOptions
): Date | null => {
	const enabled = options?.enabled ?? true;
	const hasSite = !! blog.site_ID && blog.site_ID > 0;
	const siteQuery = readSiteLatestPostQuery( blog.site_ID );
	const feedQuery = readFeedLatestPostQuery( blog.feed_ID );
	const site = useQuery( {
		...siteQuery,
		enabled: hasSite && enabled && siteQuery.enabled,
		retry: false,
		select: getLatestPostDate,
	} );
	const feed = useQuery( {
		...feedQuery,
		enabled: ! hasSite && enabled && feedQuery.enabled,
		retry: false,
		select: getLatestPostDate,
	} );
	// A failed refetch keeps the last good data, which may be stale.
	const active = hasSite ? site : feed;
	return active.isError ? null : ( active.data ?? null );
};
