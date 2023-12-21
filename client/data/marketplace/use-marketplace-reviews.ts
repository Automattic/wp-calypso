import {
	useQuery,
	UseQueryOptions,
	QueryKey,
	useMutation,
	useQueryClient,
} from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { BASE_STALE_TIME } from 'calypso/state/initial-state';

const apiBase = '/sites/marketplace.wordpress.com';
const reviewsApiBase = `${ apiBase }/comments`;
const reviewsApiNamespace = 'wp/v2';
const reviewsStatsApiBase = `${ apiBase }/marketplace/reviews`;
const reviewsStatsNamespace = 'wpcom/v2';
const queryKeyBase: QueryKey = [ 'marketplace-reviews' ];

export type ProductType = 'plugin' | 'theme';

export type ProductProps = {
	productType: ProductType;
	slug: string;
	author?: number;
	author_exclude?: number;
};

export type PaginationProps = {
	page?: number;
	perPage?: number;
};

export type MarketplaceReviewsQueryProps = ProductProps & PaginationProps;

export type MarketplaceReviewBody = {
	content: string;
	rating: number;
} & ProductProps;

type UpdateMarketplaceReviewProps = {
	reviewId: number;
} & MarketplaceReviewBody;

type DeleteMarketplaceReviewProps = {
	reviewId: number;
};

export type MarketplaceReviewResponse = {
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
	author_avatar_urls: { '24': string; '48': string; '96': string };
	link: string;
	status: string;
	type: string;
	meta: {
		wpcom_marketplace_rating: number;
	};
};

export type MarketplaceReviewsStatsResponse = {
	ratings_average: number;
	ratings_count: number;
};

export type ErrorResponse = {
	code: string;
	message: string;
	data: {
		status: number;
	};
};

type MarketplaceReviewsQueryOptions = Pick<
	UseQueryOptions< MarketplaceReviewResponse[] >,
	'enabled' | 'staleTime' | 'refetchOnMount'
>;

type MarketplaceReviewsStatsQueryOptions = Pick<
	UseQueryOptions< MarketplaceReviewsStatsResponse >,
	'enabled' | 'staleTime' | 'refetchOnMount'
>;

const fetchMarketplaceReviews = (
	productType: ProductType,
	productSlug: string,
	page: number = 1,
	perPage: number = 10,
	author?: number,
	author_exclude?: number
): Promise< MarketplaceReviewResponse[] > => {
	return wpcom.req.get(
		{
			path: reviewsApiBase,
			apiNamespace: reviewsApiNamespace,
		},
		{
			product_type: productType,
			product_slug: productSlug,
			page,
			per_page: perPage,
			...( author ? { author } : {} ),
			...( author_exclude ? { author_exclude } : {} ),
		}
	);
};

const createReview = ( {
	productType,
	slug,
	content,
	rating,
}: MarketplaceReviewBody ): Promise< MarketplaceReviewResponse > => {
	return wpcom.req.post(
		reviewsApiBase,
		{
			apiNamespace: reviewsApiNamespace,
		},
		{
			product_type: productType,
			product_slug: slug,
			content,
			meta: { wpcom_marketplace_rating: rating },
		}
	);
};

const updateReview = ( {
	reviewId,
	productType,
	slug,
	content,
	rating,
}: UpdateMarketplaceReviewProps ): Promise< MarketplaceReviewResponse > => {
	return wpcom.req.post(
		`${ reviewsApiBase }/${ reviewId }`,
		{
			apiNamespace: reviewsApiNamespace,
		},
		{
			product_type: productType,
			product_slug: slug,
			content,
			meta: { wpcom_marketplace_rating: rating },
		}
	);
};

const deleteReview = ( {
	reviewId,
}: DeleteMarketplaceReviewProps ): Promise< MarketplaceReviewResponse > => {
	return wpcom.req.post( {
		method: 'DELETE',
		path: `${ reviewsApiBase }/${ reviewId }`,
		apiNamespace: reviewsApiNamespace,
	} );
};

const fetchMarketplaceReviewsStats = ( {
	productType,
	slug,
}: ProductProps ): Promise< MarketplaceReviewsStatsResponse > => {
	return wpcom.req.get( {
		path: `${ reviewsStatsApiBase }/${ productType }/${ slug }/stats`,
		apiNamespace: reviewsStatsNamespace,
	} );
};

export const useMarketplaceReviewsQuery = (
	{ productType, slug, page, perPage, author, author_exclude }: MarketplaceReviewsQueryProps,
	{
		enabled = true,
		staleTime = BASE_STALE_TIME,
		refetchOnMount = true,
	}: MarketplaceReviewsQueryOptions = {}
) => {
	const queryKey: QueryKey = [
		queryKeyBase,
		productType,
		slug,
		author,
		author_exclude,
		page,
		perPage,
	];
	const queryFn = () =>
		fetchMarketplaceReviews( productType, slug, page, perPage, author, author_exclude );
	return useQuery( { queryKey, queryFn, enabled, staleTime, refetchOnMount } );
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

export const useMarketplaceReviewsStatsQuery = (
	productProps: ProductProps,
	{
		enabled = true,
		staleTime = BASE_STALE_TIME,
		refetchOnMount = true,
	}: MarketplaceReviewsStatsQueryOptions = {}
) => {
	const queryKey: QueryKey = [ queryKeyBase, productProps ];
	const queryFn = () => fetchMarketplaceReviewsStats( productProps );
	return useQuery( {
		queryKey,
		queryFn,
		enabled,
		staleTime,
		refetchOnMount,
	} );
};
