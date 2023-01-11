import {
	useQuery,
	UseQueryResult,
	UseQueryOptions,
	QueryKey,
	QueryFunction,
	useQueries,
} from 'react-query';
import {
	extractSearchInformation,
	normalizePluginsList,
	normalizePluginData,
} from 'calypso/lib/plugins/utils';
import wpcom from 'calypso/lib/wp';
import { BASE_STALE_TIME } from 'calypso/state/initial-state';

type Type = 'all' | 'featured';

const plugisApiBase = '/marketplace/products';
const featuredPluginsApiBase = '/plugins/featured';
const pluginsApiNamespace = 'wpcom/v2';

const WPCOM_PLUGINS_CACHE_VERSION = 1;
const getCacheKey = ( key: string ): QueryKey => [
	WPCOM_PLUGINS_CACHE_VERSION.toString(),
	'wpcom-plugins',
	key,
];

const fetchWPCOMPlugins = ( type: Type, searchTerm?: string, tag?: string ) => {
	const [ search, author ] = extractSearchInformation( searchTerm );

	return wpcom.req.get(
		{
			path: plugisApiBase,
			apiNamespace: pluginsApiNamespace,
		},
		{
			type: type,
			...( search && { q: search } ),
			...( author && { author } ),
			...( tag && ! search && { tag } ),
		}
	);
};

export const getWPCOMPluginsQueryParams = (
	type: Type,
	searchTerm?: string,
	tag?: string
): [ QueryKey, QueryFunction< any[] > ] => {
	const cacheKey = getCacheKey( type + searchTerm + tag + '-normalized' );
	const fetchFn = () =>
		fetchWPCOMPlugins( type, searchTerm, tag ).then( ( data: { results: any[] } ) =>
			normalizePluginsList( data.results )
		);
	return [ cacheKey, fetchFn ];
};

/**
 * Returns marketplace plugins list filtered by searchterm and type.
 *
 * @param {Type} type Optional The query type
 * @param {string} searchTerm Optional The term to search for
 * @param {string} tag Optional The tag to search for
 * @param {{enabled: boolean, staleTime: number, refetchOnMount: boolean}} {} Optional options to pass to the underlying query engine
 * @returns {{ data, error, isLoading: boolean ...}} Returns various parameters piped from `useQuery`
 */
export const useWPCOMPluginsList = (
	type: Type,
	searchTerm?: string,
	tag?: string,
	{ enabled = true, staleTime = BASE_STALE_TIME, refetchOnMount = true }: UseQueryOptions = {}
): UseQueryResult => {
	return useQuery( ...getWPCOMPluginsQueryParams( type, searchTerm, tag ), {
		enabled: enabled,
		staleTime: staleTime,
		refetchOnMount: refetchOnMount,
	} );
};

const fetchWPCOMPlugin = ( slug: string ) => {
	return wpcom.req.get( {
		path: `${ plugisApiBase }/${ slug }`,
		apiNamespace: pluginsApiNamespace,
	} );
};

export const getWPCOMPluginQueryParams = ( slug: string ): [ QueryKey, QueryFunction ] => {
	const cacheKey = getCacheKey( slug + '-normalized' );
	const fetchFn = () =>
		fetchWPCOMPlugin( slug ).then( ( data: any ) =>
			normalizePluginData( { detailsFetched: Date.now() }, data )
		);

	return [ cacheKey, fetchFn ];
};

/**
 * Returns a marketplace plugin data
 *
 * @param {Type} slug The plugin slug to query
 * @param {{enabled: boolean, staleTime: number, refetchOnMount: boolean}} {} Optional options to pass to the underlying query engine
 * @returns {{ data, error, isLoading: boolean ...}} Returns various parameters piped from `useQuery`
 */
export const useWPCOMPlugin = (
	slug: string,
	{ enabled = true, staleTime = BASE_STALE_TIME, refetchOnMount = true }: UseQueryOptions = {}
): UseQueryResult< any > => {
	return useQuery( ...getWPCOMPluginQueryParams( slug ), {
		enabled: enabled,
		staleTime: staleTime,
		refetchOnMount: refetchOnMount,
	} );
};

export const useWPCOMPlugins = ( slugs: Array< string > ): Array< UseQueryResult< any > > => {
	return useQueries(
		slugs.map( ( slug ) => {
			const [ cacheKey, fetchFn ] = getWPCOMPluginQueryParams( slug );

			return { queryKey: cacheKey, queryFn: fetchFn };
		} )
	);
};

export const getWPCOMFeaturedPluginsQueryParams = (): [ QueryKey, QueryFunction< any[] > ] => {
	const cacheKey = 'plugins-featured-list-normalized';
	const fetchFn = () =>
		wpcom.req
			.get( {
				path: featuredPluginsApiBase,
				apiNamespace: pluginsApiNamespace,
			} )
			.then( normalizePluginsList );
	return [ cacheKey, fetchFn ];
};

/**
 * Returns the featured list of plugins from WPCOM
 *
 * @param {{enabled: boolean, staleTime: number, refetchOnMount: boolean}} {} Optional options to pass to the underlying query engine
 * @returns {{ data, error, isLoading: boolean ...}} Returns various parameters piped from `useQuery`
 */
export const useWPCOMFeaturedPlugins = ( {
	enabled = true,
	staleTime = BASE_STALE_TIME,
	refetchOnMount = true,
}: UseQueryOptions = {} ): UseQueryResult => {
	return useQuery( ...getWPCOMFeaturedPluginsQueryParams(), {
		enabled,
		staleTime,
		refetchOnMount,
	} );
};
