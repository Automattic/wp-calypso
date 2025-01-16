import {
	useQuery,
	UseQueryResult,
	UseQueryOptions,
	QueryKey,
	QueryFunction,
	useQueries,
} from '@tanstack/react-query';
import {
	extractSearchInformation,
	normalizePluginsList,
	normalizePluginData,
} from 'calypso/lib/plugins/utils';
import wpcom from 'calypso/lib/wp';
import { BASE_STALE_TIME } from 'calypso/state/constants';
import type { Plugin } from 'calypso/state/plugins/installed/types';

type Type = 'all' | 'featured' | 'launched';

const pluginsApiBase = '/marketplace/products';
const featuredPluginsApiBase = '/plugins/featured';
const pluginsApiNamespace = 'wpcom/v2';

const WPCOM_PLUGINS_CACHE_VERSION = 2;
const getCacheKey = ( key: string ): QueryKey => [
	WPCOM_PLUGINS_CACHE_VERSION.toString(),
	'wpcom-plugins',
	key,
];

const fetchWPCOMPlugins = ( type: Type, searchTerm?: string, tag?: string ) => {
	const [ search, author ] = extractSearchInformation( searchTerm );

	return wpcom.req.get(
		{
			path: pluginsApiBase,
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
): { queryKey: QueryKey; queryFn: QueryFunction< Plugin[] > } => {
	const queryKey = getCacheKey( type + searchTerm + tag + '-normalized' );
	const queryFn = () =>
		fetchWPCOMPlugins( type, searchTerm, tag ).then( ( data: { results: Plugin[] } ) =>
			normalizePluginsList( data.results )
		);
	return { queryKey, queryFn };
};

/**
 * Returns marketplace plugins list filtered by searchterm and type.
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
	{
		enabled = true,
		staleTime = BASE_STALE_TIME,
		refetchOnMount = true,
	}: Omit< UseQueryOptions< Plugin[] >, 'queryKey' > = {}
): UseQueryResult< Plugin[] > => {
	return useQuery( {
		...getWPCOMPluginsQueryParams( type, searchTerm, tag ),
		enabled: enabled,
		staleTime: staleTime,
		refetchOnMount: refetchOnMount,
	} );
};

const fetchWPCOMPlugin = ( slug: string ) =>
	wpcom.req.get( {
		path: `${ pluginsApiBase }/${ slug }`,
		apiNamespace: pluginsApiNamespace,
	} );

export const getWPCOMPluginQueryParams = (
	slug: string
): { queryKey: QueryKey; queryFn: QueryFunction } => {
	const queryKey = getCacheKey( slug + '-normalized' );
	const queryFn = () =>
		fetchWPCOMPlugin( slug ).then( ( data: any ) =>
			normalizePluginData( { detailsFetched: Date.now() }, data )
		);

	return { queryKey, queryFn };
};

/**
 * Returns a marketplace plugin data
 * @param {Type} slug The plugin slug to query
 * @param {{enabled: boolean, staleTime: number, refetchOnMount: boolean}} {} Optional options to pass to the underlying query engine
 * @returns {{ data, error, isLoading: boolean ...}} Returns various parameters piped from `useQuery`
 */
export const useWPCOMPlugin = (
	slug: string,
	{
		enabled = true,
		staleTime = BASE_STALE_TIME,
		refetchOnMount = true,
	}: Omit< UseQueryOptions, 'queryKey' > = {}
): UseQueryResult< any > => {
	return useQuery( {
		...getWPCOMPluginQueryParams( slug ),
		enabled: enabled,
		staleTime: staleTime,
		refetchOnMount: refetchOnMount,
	} );
};

export const useWPCOMPlugins = ( slugs: Array< string > ): Array< UseQueryResult< any > > => {
	return useQueries( {
		queries: slugs.map( ( slug ) => {
			return getWPCOMPluginQueryParams( slug );
		} ),
	} );
};

export const getWPCOMFeaturedPluginsQueryParams = (): {
	queryKey: QueryKey;
	queryFn: QueryFunction;
} => {
	const queryKey = [ 'plugins-featured-list-normalized' ];
	const queryFn = () =>
		wpcom.req
			.get( {
				path: featuredPluginsApiBase,
				apiNamespace: pluginsApiNamespace,
			} )
			.then( normalizePluginsList );
	return { queryKey, queryFn };
};

/**
 * Returns the featured list of plugins from WPCOM
 * @param {{enabled: boolean, staleTime: number, refetchOnMount: boolean}} {} Optional options to pass to the underlying query engine
 * @returns {{ data, error, isLoading: boolean ...}} Returns various parameters piped from `useQuery`
 */
export const useWPCOMFeaturedPlugins = ( {
	enabled = true,
	staleTime = BASE_STALE_TIME,
	refetchOnMount = true,
}: Omit< UseQueryOptions, 'queryKey' > = {} ): UseQueryResult => {
	return useQuery( {
		...getWPCOMFeaturedPluginsQueryParams(),
		enabled,
		staleTime,
		refetchOnMount,
	} );
};
