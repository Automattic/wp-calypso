import {
	useQuery,
	useInfiniteQuery,
	UseQueryResult,
	UseQueryOptions,
	QueryKey,
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

type WPORGOptionsType = {
	pageSize?: number;
	page?: number;
	category?: string;
	searchTerm?: string;
	tag?: string;
	locale: string;
};

const getCacheKey = ( key: string ): QueryKey => [ 'wporg-plugins', key ];

const getPluginsListKey = ( options: WPORGOptionsType, infinite?: boolean ): QueryKey =>
	getCacheKey(
		`${ infinite ? 'infinite' : '' }${ options.category || '' }_${ options.searchTerm || '' }_${
			options.page || ''
		}_${ options.tag && ! options.searchTerm ? options.tag : '' }_${ options.pageSize || '' }_${
			options.locale || ''
		}`
	);

export const useWPORGPlugins = (
	options: WPORGOptionsType,
	{ enabled = true, staleTime = 1000 * 60 * 60 * 2, refetchOnMount = true }: UseQueryOptions = {}
): UseQueryResult => {
	const [ search, author ] = extractSearchInformation( options.searchTerm );
	const locale = useSelector( getCurrentUserLocale );

	return useQuery(
		getPluginsListKey( options ),
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

const extractPages = ( pages: Array< { plugins: object; info: object } > = [] ) =>
	pages.flatMap( ( page ) => page.plugins ).map( normalizePluginData );

const extractPagination = ( pages: Array< { plugins: object; info: object } > = [] ) =>
	pages[ pages.length - 1 ].info;

export const useWPORGInfinitePlugins = (
	options: WPORGOptionsType,
	{ enabled = true, staleTime = 1000 * 60 * 60 * 2, refetchOnMount = true }: UseQueryOptions = {}
): UseQueryResult => {
	const [ search, author ] = extractSearchInformation( options.searchTerm );
	const locale = useSelector( getCurrentUserLocale );

	return useInfiniteQuery(
		getPluginsListKey( options, true ),
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
			select: ( data: InfiniteData< { plugins: object; info: { page: number } } > ) => {
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
