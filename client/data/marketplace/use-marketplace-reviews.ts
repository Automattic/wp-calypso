import {
	useQuery,
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

type MarketplaceReviewResponse = {
	id: number;
	post: number;
	parent: number;
	author: number;
	author_name: string;
	author_url: string;
	date: string;
	date_gmt: string;
	content: {
		rendered: string;
	};
	link: string;
	status: string;
	type: string;
	meta: {
		wpcom_marketplace_rating: number;
	};
};

type ErrorResponse = {
	code: string;
	message: string;
	data: {
		status: number;
	};
};

type MarketplaceReviewsQueryOptions = Pick<
	UseQueryOptions< MarketplaceReviewResponse[] | ErrorResponse >,
	'enabled' | 'staleTime' | 'refetchOnMount'
>;

const fetchMarketplaceReviews = (
	productType: ProductType,
	productSlug: string
): Promise< MarketplaceReviewResponse[] | ErrorResponse > => {
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

const createReview = ( {
	productType,
	pluginSlug,
	content,
	rating,
}: MarketplaceReviewBody ): Promise< MarketplaceReviewResponse | ErrorResponse > => {
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
}: UpdateMarketplaceReviewProps ): Promise< MarketplaceReviewResponse | ErrorResponse > => {
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

const deleteReview = ( {
	reviewId,
}: DeleteMarketplaceReviewProps ): Promise< MarketplaceReviewResponse | ErrorResponse > => {
	return wpcom.req.post( {
		method: 'DELETE',
		path: `${ reviewsApiBase }/${ reviewId }`,
		apiNamespace: reviewsApiNamespace,
	} );
};

export const useMarketplaceReviewsQuery = (
	{ productType, pluginSlug }: ProductProps,
	{
		enabled = true,
		staleTime = BASE_STALE_TIME,
		refetchOnMount = true,
	}: MarketplaceReviewsQueryOptions = {}
) => {
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

export const useCreateMarketplaceReviewMutation = () => {
	const queryClient = useQueryClient();
	return useMutation( {
		mutationFn: createReview,
		onSuccess: () => {
			queryClient.invalidateQueries( { queryKey: queryKeyBase } );
		},
	} );
};

export const useUpdateMarketplaceReviewMutation = () => {
	const queryClient = useQueryClient();
	return useMutation( {
		mutationFn: updateReview,
		onSuccess: () => {
			queryClient.invalidateQueries( { queryKey: queryKeyBase } );
		},
	} );
};

export const useDeleteMarketplaceReviewMutation = () => {
	const queryClient = useQueryClient();
	return useMutation( {
		mutationFn: deleteReview,
		onSuccess: () => {
			queryClient.invalidateQueries( { queryKey: queryKeyBase } );
		},
	} );
};
