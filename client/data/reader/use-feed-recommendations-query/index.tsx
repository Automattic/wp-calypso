import { readListItemsAllQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';

interface QueryOptions {
	enabled?: boolean;
}

interface APIFeedRecommendation {
	meta: {
		data: {
			site?: {
				name: string;
				feed_URL: string;
				ID: string;
				icon: {
					img?: string;
					ico?: string;
				};
				description: string;
			};
			feed?: {
				image: string;
				name: string;
				feed_URL: string;
				blog_ID: string;
			};
		};
	};
	feed_ID: string;
}

export interface FeedRecommendation {
	ID: string;
	image?: string;
	name?: string;
	feedUrl?: string;
	siteId?: string;
	feedId: string;
}

// A blog from a list may have either a site or feed object, and the data is
// structured in different property names. This function normalizes the data to
// a consistent format.
const normalizeFeedRecommendation = ( blog: APIFeedRecommendation ): FeedRecommendation => {
	if ( blog.meta?.data?.site ) {
		const { name, feed_URL: feedUrl, ID: siteId, icon } = blog.meta.data.site;
		return {
			ID: blog.meta.data.site.ID,
			image: icon?.img || icon?.ico,
			name,
			feedUrl,
			siteId,
			feedId: blog.feed_ID,
		};
	}
	const { image, name, feed_URL: feedUrl, blog_ID: siteId } = blog.meta?.data?.feed || {};
	return {
		ID: blog.meta?.data?.feed?.blog_ID || '',
		image,
		name,
		feedUrl,
		siteId,
		feedId: blog.feed_ID,
	};
};

/**
 * Hook to fetch and manage user recommended blogs.
 *
 * `readListItemsAllQuery` already short-circuits retries for the
 * `list_not_found` error (matching the legacy `noRetry()` policy), so this
 * hook only adds normalization on top.
 */
export const useFeedRecommendationsQuery = ( userLogin?: string, options?: QueryOptions ) => {
	const { enabled = true } = options || {};

	const { data, isLoading, isFetched } = useQuery( {
		...readListItemsAllQuery( userLogin, 'recommended-blogs' ),
		enabled: !! userLogin && enabled,
		select: ( response ): FeedRecommendation[] =>
			( response.items as unknown as APIFeedRecommendation[] ).map( normalizeFeedRecommendation ),
	} );

	return {
		isLoading,
		data: data ?? ( [] as FeedRecommendation[] ),
		isFetched,
	};
};
