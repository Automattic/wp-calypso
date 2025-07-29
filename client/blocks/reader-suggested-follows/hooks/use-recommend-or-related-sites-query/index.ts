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
	const { author, siteId, postId } = query;
	const userLogin = author?.wpcom_login || author?.ID;
	const enabled = options?.enabled ?? true;

	const {
		data: recommendedFeeds,
		isLoading: isLoadingRecommendedFeeds,
		isSuccess: isSuccessRecommendedFeeds,
	} = useFeedRecommendationsQuery( userLogin, {
		enabled: !! userLogin && enabled,
	} );

	const hasRecommendedFeeds = recommendedFeeds && recommendedFeeds.length > 0;
	const shouldLoadRelatedSites = enabled && isSuccessRecommendedFeeds && ! hasRecommendedFeeds;

	const {
		data: relatedSites,
		isLoading: isLoadingRelatedSites,
		isSuccess: isSuccessRelatedSites,
	} = useRelatedSites( siteId, postId, {
		enabled: shouldLoadRelatedSites,
	} );

	const data = recommendedFeeds?.length > 0 ? recommendedFeeds : relatedSites;
	const isLoading = isLoadingRecommendedFeeds || isLoadingRelatedSites;
	const isSuccess = isSuccessRecommendedFeeds || isSuccessRelatedSites;

	return {
		data: isSuccess ? data : [],
		isLoading,
		isSuccess,
		resourceType: getResourceType( recommendedFeeds, relatedSites ),
	};
};
