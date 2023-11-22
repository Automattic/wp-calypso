import {
	useQuery,
	UseQueryResult,
	UseQueryOptions,
	QueryKey,
	useMutation,
	useQueryClient,
} from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { BASE_STALE_TIME } from 'calypso/state/initial-state';

const reviewsApiBase = '/sites/marketplace.wordpress.com/comments';
const reviewsApiNamespace = 'wp/v2';
const queryKeyBase: QueryKey = [ 'marketplace-reviews' ];

type ProductType = 'plugin' | 'theme';

type ProductProps = {
	productType: ProductType;
	pluginSlug: string;
};

type MarketplaceReviewBody = {
	content: string;
	rating: number;
} & ProductProps;

type UpdateMarketplaceReviewProps = {
	reviewId: number;
} & MarketplaceReviewBody;

type DeleteMarketplaceReviewProps = {
	reviewId: number;
} & ProductProps;

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

const createReview = ( { productType, pluginSlug, content, rating }: MarketplaceReviewBody ) => {
	return wpcom.req.post(
		reviewsApiBase,
		{
			apiNamespace: reviewsApiNamespace,
		},
		{
			product_type: productType,
			product_slug: pluginSlug,
			content,
			meta: { wpcom_marketplace_rating: rating },
		}
	);
};

const updateReview = ( {
	reviewId,
	productType,
	pluginSlug,
	content,
	rating,
}: UpdateMarketplaceReviewProps ) => {
	return wpcom.req.post(
		`${ reviewsApiBase }/${ reviewId }`,
		{
			apiNamespace: reviewsApiNamespace,
		},
		{
			product_type: productType,
			product_slug: pluginSlug,
			content,
			meta: { wpcom_marketplace_rating: rating },
		}
	);
};

const deleteReview = ( { reviewId }: DeleteMarketplaceReviewProps ) => {
	return wpcom.req.del( `${ reviewsApiBase }/${ reviewId }`, {
		apiNamespace: reviewsApiNamespace,
	} );
};

export const useMarketplaceReviews = (
	{ productType, pluginSlug }: ProductProps,
	{ enabled = true, staleTime = BASE_STALE_TIME, refetchOnMount = true }: UseQueryOptions = {}
): UseQueryResult< any > => {
	const queryKey: QueryKey = [ queryKeyBase, pluginSlug ];
	const queryFn = () => fetchMarketplaceReviews( productType, pluginSlug );
	return useQuery( {
		queryKey,
		queryFn,
		enabled,
		staleTime,
		refetchOnMount,
	} );
};

export const useCreateMarketplaceReview = () => {
	const queryClient = useQueryClient();
	return useMutation( {
		mutationFn: createReview,
		onSuccess: () => {
			queryClient.invalidateQueries( queryKeyBase );
		},
	} );
};

export const useUpdateMarketplaceReview = () => {
	const queryClient = useQueryClient();
	return useMutation( {
		mutationFn: updateReview,
		onSuccess: () => {
			queryClient.invalidateQueries( queryKeyBase );
		},
	} );
};

export const useDeleteMarketplaceReview = () => {
	const queryClient = useQueryClient();
	return useMutation( {
		mutationFn: deleteReview,
		onSuccess: () => {
			queryClient.invalidateQueries( queryKeyBase );
		},
	} );
};
