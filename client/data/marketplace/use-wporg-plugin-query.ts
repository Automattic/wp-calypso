import {
	useQuery,
	useInfiniteQuery,
	UseQueryResult,
	UseQueryOptions,
	InfiniteData,
} from 'react-query';
import { useSelector } from 'react-redux';
import {
	extractSearchInformation,
	normalizePluginsList,
	normalizePluginData,
} from 'calypso/lib/plugins/utils';
import { fetchPluginsList } from 'calypso/lib/wporg';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { BASE_STALE_TIME, WPORG_CACHE_KEY } from './constants';
import { Plugin, PluginQueryOptions } from './types';
import { getPluginsListKey } from './utils';

export const useWPORGPlugins = (
	options: PluginQueryOptions,
	{ enabled = true, staleTime = BASE_STALE_TIME, refetchOnMount = true }: UseQueryOptions = {}
): UseQueryResult => {
	const [ search, author ] = extractSearchInformation( options.searchTerm );
	const locale = useSelector( getCurrentUserLocale );

	return useQuery(
		getPluginsListKey( WPORG_CACHE_KEY, options ),
		() =>
			fetchPluginsList( {
				pageSize: options.pageSize,
				page: options.page,
				category: options.category,
				locale: options.locale || locale,
				search,
				author,
				tag: options.tag && ! search ? options.tag : null,
			} ),
		{
			select: ( { plugins = [], info = {} } ) => ( {
				plugins: normalizePluginsList( plugins ),
				pagination: info,
			} ),
			enabled: enabled,
			staleTime: staleTime,
			refetchOnMount: refetchOnMount,
		}
	);
};

const extractPages = ( pages: Array< { plugins: Plugin[]; info: object } > = [] ) =>
	pages.flatMap( ( page ) => page.plugins ).map( normalizePluginData );

const extractPagination = ( pages: Array< { plugins: object; info: object } > = [] ) =>
	pages[ pages.length - 1 ].info;

export const useWPORGInfinitePlugins = (
	options: PluginQueryOptions,
	{ enabled = true, staleTime = BASE_STALE_TIME, refetchOnMount = true }: UseQueryOptions = {}
): UseQueryResult => {
	const [ search, author ] = extractSearchInformation( options.searchTerm );
	const locale = useSelector( getCurrentUserLocale );

	return useInfiniteQuery(
		getPluginsListKey( WPORG_CACHE_KEY, options, true ),
		( { pageParam = 1 } ) =>
			fetchPluginsList( {
				pageSize: options.pageSize,
				page: pageParam,
				category: options.category,
				locale: options.locale || locale,
				search,
				tag: options.tag && ! search ? options.tag : null,
				author,
			} ),
		{
			select: ( data: InfiniteData< { plugins: Plugin[]; info: { page: number } } > ) => {
				return {
					...data,
					plugins: extractPages( data.pages ),
					pagination: extractPagination( data.pages ),
				};
			},
			getNextPageParam: ( lastPage ) => {
				return ( lastPage.info.page || 0 ) + 1;
			},
			enabled: enabled,
			staleTime: staleTime,
			refetchOnMount: refetchOnMount,
		}
	);
};
