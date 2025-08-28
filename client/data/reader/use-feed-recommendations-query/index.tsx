import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { requestUserRecommendedBlogs } from 'calypso/state/reader/lists/actions';
import {
	getUserRecommendedBlogs,
	hasRequestedUserRecommendedBlogs,
	isRequestingUserRecommendedBlogs,
} from 'calypso/state/reader/lists/selectors';

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

// A blog from a list may have either a site or feed object, and the data is structured in different
// property names. This function normalizes the data to a consistent format.
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
 * @param userLogin - The user login to fetch recommendations for
 * @param options - Optional configuration
 * @param options.enabled - Whether the query should be enabled (default: true)
 * @returns Object containing loading state, data, and success status
 */
export const useFeedRecommendationsQuery = ( userLogin?: string, options?: QueryOptions ) => {
	const { enabled = true } = options || {};
	const dispatch = useDispatch();
	const hasRequested = useSelector( ( state ) =>
		hasRequestedUserRecommendedBlogs( state, userLogin || '' )
	);

	const isRequesting = useSelector( ( state ) =>
		isRequestingUserRecommendedBlogs( state, userLogin || '' )
	);

	const recommendedBlogs = useSelector( ( state ) =>
		getUserRecommendedBlogs( state, userLogin || '' )
	);

	const needsRequest = ! recommendedBlogs && userLogin && ! hasRequested && enabled;

	useEffect( () => {
		if ( needsRequest ) {
			dispatch( requestUserRecommendedBlogs( userLogin ) );
		}
	}, [ userLogin, needsRequest, dispatch ] );

	const feedRecommendations = useMemo< FeedRecommendation[] >(
		() => recommendedBlogs?.map?.( normalizeFeedRecommendation ),
		[ recommendedBlogs ]
	);

	return {
		isLoading: isRequesting || needsRequest,
		data: feedRecommendations ?? [],
		isFetched: ! isRequesting && hasRequested && ! needsRequest,
	};
};
