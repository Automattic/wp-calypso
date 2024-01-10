import {
	useQuery,
	useInfiniteQuery,
	UseQueryResult,
	UseQueryOptions,
	InfiniteData,
	UseInfiniteQueryResult,
	QueryKey,
	QueryFunction,
} from '@tanstack/react-query';
import {
	extractSearchInformation,
	normalizePluginsList,
	normalizePluginData,
} from 'calypso/lib/plugins/utils';
import { fetchPluginsList } from 'calypso/lib/wporg';
import { useSelector } from 'calypso/state';
import { BASE_STALE_TIME } from 'calypso/state/constants';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { WPORG_CACHE_KEY } from './constants';
import { Plugin, PluginQueryOptions } from './types';
import { getPluginsListKey } from './utils';

export const getWPORGPluginsQueryParams = (
	options: PluginQueryOptions,
	locale: string
): {
	queryKey: QueryKey;
	queryFn: QueryFunction< { plugins: any[]; pagination: { page: number } }, QueryKey >;
} => {
	const queryKey = getPluginsListKey( [ WPORG_CACHE_KEY, 'normalized' ], options );
	const queryFn = () => {
		const [ search, author ] = extractSearchInformation( options.searchTerm );
		return fetchPluginsList( {
			pageSize: options.pageSize,
			page: options.page,
			category: options.category,
			locale: options.locale || locale,
			search,
			author,
			tag: options.tag && ! search ? options.tag : null,
		} ).then( ( { plugins = [], info = {} } ) => ( {
			plugins: normalizePluginsList( plugins ),
			pagination: info,
		} ) );
	};
	return { queryKey, queryFn };
};

export const useWPORGPlugins = (
	options: PluginQueryOptions,
	{
		enabled = true,
		staleTime = BASE_STALE_TIME,
		refetchOnMount = true,
	}: Omit< UseQueryOptions< any >, 'queryKey' > = {}
): UseQueryResult => {
	const locale = useSelector( getCurrentUserLocale );

	return useQuery( {
		...getWPORGPluginsQueryParams( options, locale ),
		enabled: enabled,
		staleTime: staleTime,
		refetchOnMount: refetchOnMount,
	} );
};

const extractPages = ( pages: Array< { plugins: Plugin[]; info: object } > = [] ) =>
	pages.flatMap( ( page ) => page.plugins ).map( normalizePluginData );

const extractPagination = ( pages: Array< { plugins: object; info: object } > = [] ) =>
	pages[ pages.length - 1 ].info;

export const useWPORGInfinitePlugins = (
	options: PluginQueryOptions,
	{
		enabled = true,
		staleTime = BASE_STALE_TIME,
		refetchOnMount = true,
	}: Omit< UseQueryOptions< any >, 'queryKey' > = {}
): UseInfiniteQueryResult => {
	const [ search, author ] = extractSearchInformation( options.searchTerm );
	const locale = useSelector( getCurrentUserLocale );

	return useInfiniteQuery( {
		queryKey: getPluginsListKey( [ WPORG_CACHE_KEY ], options, true ),
		queryFn: ( { pageParam } ) =>
			fetchPluginsList( {
				pageSize: options.pageSize,
				page: pageParam,
				category: options.category,
				locale: options.locale || locale,
				search,
				tag: options.tag && ! search ? options.tag : null,
				author,
			} ),
		select: (
			data: InfiniteData< { plugins: Plugin[]; info: { page: number; pages: number } } >
		) => {
			return {
				...data,
				plugins: extractPages( data.pages ),
				pagination: extractPagination( data.pages ),
			};
		},
		initialPageParam: 1,
		getNextPageParam: ( lastPage: { info: { page: number; pages: number } } ) => {
			// When on last page, the next page is undefined, according to docs.
			// @see: https://tanstack.com/query/v4/docs/reference/useInfiniteQuery
			if ( lastPage.info.pages <= lastPage.info.page ) {
				return undefined;
			}

			return ( lastPage.info.page || 0 ) + 1;
		},
		enabled: enabled,
		staleTime: staleTime,
		refetchOnMount: refetchOnMount,
	} );
};
