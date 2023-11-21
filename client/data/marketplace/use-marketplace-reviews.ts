import { useQuery, UseQueryResult, UseQueryOptions, QueryKey } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { BASE_STALE_TIME } from 'calypso/state/initial-state';

const reviewsApiBase = '/sites/marketplace.wordpress.com/comments';
const reviewsApiNamespace = 'wp/v2';

type ProductType = 'plugin' | 'theme';

const fetchMarketplaceReviews = ( productType: ProductType, productSlug: string ) => {
	return wpcom.req.get(
		{
			path: reviewsApiBase,
			apiNamespace: reviewsApiNamespace,
		},
		{
			product_type: productType,
			product_slug: productSlug,
		}
	);
};

export const useMarketplaceReviews = (
	pluginSlug: string,
	{ enabled = true, staleTime = BASE_STALE_TIME, refetchOnMount = true }: UseQueryOptions = {}
): UseQueryResult< any > => {
	const queryKey: QueryKey = [ 'marketplace-reviews', pluginSlug ];
	const queryFn = () => fetchMarketplaceReviews( 'plugin', pluginSlug );
	return useQuery( {
		queryKey,
		queryFn,
		enabled,
		staleTime,
		refetchOnMount,
	} );
};
