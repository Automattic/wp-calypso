import { readStreamLatestPostQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import type { RecommendedBlog } from './types';
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

/**
 * Fetches a recommended blog's latest post date. Returns `null` while loading
 * and when the lookup fails, so callers show no date rather than a wrong one.
 *
 * Blogs with a site ID read the site's post stream, as the Reader's site pages
 * do; feed-only blogs (site ID 0) read the feed's.
 */
export const useLatestPostDate = (
	blog: Pick< RecommendedBlog, 'feed_ID' | 'site_ID' >
): Date | null => {
	let streamKey = '';
	if ( blog.site_ID > 0 ) {
		streamKey = `site:${ blog.site_ID }`;
	} else if ( blog.feed_ID > 0 ) {
		streamKey = `feed:${ blog.feed_ID }`;
	}
	const latestPost = useQuery( {
		...readStreamLatestPostQuery( streamKey ),
		enabled: streamKey !== '',
		retry: false,
		select: getLatestPostDate,
	} );
	// A failed refetch keeps the last good data, which may be stale.
	return latestPost.isError ? null : ( latestPost.data ?? null );
};
