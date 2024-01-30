import {
	useQuery,
	UseQueryOptions,
	QueryKey,
	useMutation,
	useQueryClient,
	useInfiniteQuery,
} from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { BASE_STALE_TIME } from 'calypso/state/constants';

export const EMPTY_PLACEHOLDER = '&nbsp;';

const apiBase = '/sites/marketplace.wordpress.com';
const reviewsApiBase = `${ apiBase }/comments`;
const reviewsApiNamespace = 'wp/v2';
const reviewsUtilsApiBase = `${ apiBase }/marketplace/reviews`;
const reviewsUtilsNamespace = 'wpcom/v2';
const queryKeyBase: QueryKey = [ 'marketplace-reviews' ];

export type ProductType = 'plugin' | 'theme';

export type ProductProps = {
	productType: ProductType;
	slug: string;
	author?: number;
};

export type FilteringProps = {
	author_exclude?: number;
	status?: 'approved' | 'hold' | 'all';
};

export type PaginationProps = {
	page?: number;
	perPage?: number;
};

export type ProductDefinitionProps = Omit< ProductProps, 'author' >;

export type MarketplaceReviewsQueryProps = ProductProps & FilteringProps & PaginationProps;

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
		raw: string;
	};
	author_avatar_urls: { '24': string; '48': string; '96': string };
	link: string;
	status: 'approved' | 'hold' | 'all';
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

export type HeaderResponse = {
	'X-WP-TotalPages': number;
};

export type InfiniteMarketplaceReviewResponse = {
	data: {
		reviews: MarketplaceReviewResponse[];
	};
	refetch: () => void;
	fetchNextPage: () => void;
	error?: ErrorResponse;
};

type MarketplaceReviewsQueryResponse = {
	data: MarketplaceReviewResponse[];
	headers: HeaderResponse;
};

type MarketplaceReviewsQueryOptions = Pick<
	UseQueryOptions< MarketplaceReviewsQueryResponse >,
	'enabled' | 'staleTime' | 'refetchOnMount'
>;

type MarketplaceReviewsStatsQueryOptions = Pick<
	UseQueryOptions< MarketplaceReviewsStatsResponse >,
	'enabled' | 'staleTime' | 'refetchOnMount'
>;
type MarketplaceReviewsValidateQueryOptions = Pick<
	UseQueryOptions< MarketplaceReviewsValidateQueryResponse >,
	'enabled' | 'staleTime' | 'refetchOnMount'
>;

type MarketplaceReviewsValidateQueryResponse = {
	valid: boolean;
	message?: string;
};

const fetchMarketplaceReviews = (
	productType: ProductType,
	productSlug: string,
	page: number = 1,
	perPage: number = 10,
	author?: number,
	author_exclude?: number,
	status?: string
): Promise< MarketplaceReviewsQueryResponse > => {
	return new Promise( ( resolve, reject ) => {
		wpcom.req.get(
			{
				path: reviewsApiBase,
				apiNamespace: reviewsApiNamespace,
			},
			{
				product_type: productType,
				product_slug: productSlug,
				context: 'edit', // https://developer.wordpress.org/rest-api/reference/comments/#retrieve-a-comment
				page,
				per_page: perPage,
				...( author ? { author } : {} ),
				...( author_exclude ? { author_exclude } : {} ),
				...( status ? { status } : {} ),
			},
			( error: ErrorResponse, data: MarketplaceReviewResponse[], headers: HeaderResponse ) => {
				if ( error ) {
					return reject( error );
				}

				resolve( { data, headers } );
			}
		);
	} );
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
			content: content || EMPTY_PLACEHOLDER,
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
			content: content || EMPTY_PLACEHOLDER,
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
		path: `${ reviewsUtilsApiBase }/${ productType }/${ slug }/stats`,
		apiNamespace: reviewsUtilsNamespace,
	} );
};

const fetchIsUserAllowedToReview = ( {
	productType,
	slug,
}: ProductProps ): Promise< MarketplaceReviewsValidateQueryResponse > => {
	return wpcom.req.get( {
		path: `${ reviewsUtilsApiBase }/${ productType }/${ slug }/validate`,
		apiNamespace: reviewsUtilsNamespace,
	} );
};

export const useMarketplaceReviewsQuery = (
	{
		productType,
		slug,
		page,
		perPage,
		author,
		author_exclude,
		status,
	}: MarketplaceReviewsQueryProps,
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
		status,
		page,
		perPage,
	];
	const queryFn = () =>
		fetchMarketplaceReviews( productType, slug, page, perPage, author, author_exclude, status );
	return useQuery( {
		queryKey,
		queryFn,
		enabled,
		staleTime,
		refetchOnMount,
		select: ( response ) => response.data,
	} );
};

export const useInfiniteMarketplaceReviewsQuery = (
	{ productType, slug, page, perPage, author, author_exclude }: MarketplaceReviewsQueryProps,
	{ enabled = true, staleTime = BASE_STALE_TIME }: MarketplaceReviewsQueryOptions = {}
) => {
	const queryKey: QueryKey = [
		queryKeyBase,
		productType,
		slug,
		author,
		author_exclude,
		page,
		perPage,
		'infinite',
	];

	return useInfiniteQuery< MarketplaceReviewsQueryResponse >( {
		queryKey,
		queryFn: ( { pageParam } ) =>
			fetchMarketplaceReviews(
				productType,
				slug,
				pageParam as number,
				perPage,
				author,
				author_exclude
			),
		getNextPageParam: ( lastPage, allPages ) => {
			if ( lastPage.headers[ 'X-WP-TotalPages' ] <= allPages.length ) {
				return;
			}
			return allPages.length + 1;
		},
		initialPageParam: 1,
		enabled,
		staleTime,
	} );
};

export const useCreateMarketplaceReviewMutation = ( {
	productType,
	slug,
}: ProductDefinitionProps ) => {
	const queryClient = useQueryClient();
	const queryKeyPrefix = [ queryKeyBase, productType, slug ];

	return useMutation< MarketplaceReviewResponse, ErrorResponse, MarketplaceReviewBody >( {
		mutationFn: createReview,
		onSuccess: () => {
			queryClient.invalidateQueries( { queryKey: queryKeyPrefix } );
		},
	} );
};

export const useUpdateMarketplaceReviewMutation = ( {
	productType,
	slug,
}: ProductDefinitionProps ) => {
	const queryClient = useQueryClient();
	const queryKeyPrefix = [ queryKeyBase, productType, slug ];

	return useMutation< MarketplaceReviewResponse, ErrorResponse, UpdateMarketplaceReviewProps >( {
		mutationFn: updateReview,
		onSuccess: () => {
			queryClient.invalidateQueries( { queryKey: queryKeyPrefix } );
		},
	} );
};

export const useDeleteMarketplaceReviewMutation = ( {
	productType,
	slug,
}: ProductDefinitionProps ) => {
	const queryClient = useQueryClient();
	const queryKeyPrefix = [ queryKeyBase, productType, slug ];

	return useMutation< MarketplaceReviewResponse, ErrorResponse, DeleteMarketplaceReviewProps >( {
		mutationFn: deleteReview,
		onSuccess: () => {
			queryClient.invalidateQueries( { queryKey: queryKeyPrefix } );
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
	const queryKey: QueryKey = [ queryKeyBase, productProps.productType, productProps.slug, 'stats' ];
	const queryFn = () => fetchMarketplaceReviewsStats( productProps );
	return useQuery( {
		queryKey,
		queryFn,
		enabled,
		staleTime,
		refetchOnMount,
	} );
};

export const useIsUserAllowedToReview = (
	productProps: ProductProps,
	{
		enabled = true,
		staleTime = BASE_STALE_TIME,
		refetchOnMount = true,
	}: MarketplaceReviewsValidateQueryOptions = {}
) => {
	const queryKey: QueryKey = [
		queryKeyBase,
		productProps.productType,
		productProps.slug,
		'validate',
	];

	const queryFn = () => fetchIsUserAllowedToReview( productProps );
	return useQuery( {
		queryKey,
		queryFn,
		select: ( response ) => response.valid,
		enabled,
		staleTime,
		refetchOnMount,
	} );
};
