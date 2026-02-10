import {
	FeedRecommendation,
	useFeedRecommendationsQuery,
} from 'calypso/data/reader/use-feed-recommendations-query';
import { RelatedSite, useRelatedSites } from 'calypso/data/reader/use-related-sites';

interface Author {
	wpcom_login: string;
	ID: string;
	name: string;
}

interface QueryParams {
	author?: Author;
	siteId: number;
	postId: number;
	excludeSiteId?: number;
}

interface QueryOptions {
	enabled: boolean;
}

const getResourceType = (
	recommendedFeeds: FeedRecommendation[] | null | undefined,
	relatedSites: RelatedSite[] | null | undefined
) => {
	if ( Array.isArray( recommendedFeeds ) && recommendedFeeds?.length > 0 ) {
		return 'recommended';
	}

	if ( Array.isArray( relatedSites ) && relatedSites?.length > 0 ) {
		return 'related';
	}

	return null;
};

export const useRecommendOrRelatedSitesQuery = ( query: QueryParams, options?: QueryOptions ) => {
	const { author, siteId, postId, excludeSiteId } = query;
	const userLogin = author?.wpcom_login || author?.ID;
	const enabled = options?.enabled ?? true;
	const hasUserLogin = Boolean( userLogin );

	const {
		data: recommendedFeeds,
		isLoading: isLoadingRecommendedFeeds,
		isFetched: isFetchedRecommendedFeeds,
	} = useFeedRecommendationsQuery( userLogin, {
		enabled: !! userLogin && enabled,
	} );

	const hasRecommendedFeeds = recommendedFeeds && recommendedFeeds.length > 0;
	const shouldLoadRelatedSites =
		! hasUserLogin || ( isFetchedRecommendedFeeds && ! hasRecommendedFeeds );

	const {
		data: relatedSites,
		isLoading: isLoadingRelatedSites,
		isFetched: isFetchedRelatedSites,
	} = useRelatedSites( siteId, postId, {
		enabled: shouldLoadRelatedSites && enabled,
	} );

	// Filter out the excluded site from both recommended feeds and related sites
	const filteredRecommendedFeeds = excludeSiteId
		? recommendedFeeds?.filter( ( feed ) => Number( feed.siteId ) !== excludeSiteId )
		: recommendedFeeds;

	const filteredRelatedSites = excludeSiteId
		? relatedSites?.filter( ( site ) => site.site_ID !== excludeSiteId )
		: relatedSites;

	const data =
		filteredRecommendedFeeds?.length > 0 ? filteredRecommendedFeeds : filteredRelatedSites;
	const isLoading = isLoadingRecommendedFeeds || isLoadingRelatedSites;
	const isFetched = isFetchedRecommendedFeeds || isFetchedRelatedSites;

	return {
		data: isFetched ? data : [],
		isLoading,
		isFetched,
		resourceType: getResourceType( filteredRecommendedFeeds, filteredRelatedSites ),
	};
};
