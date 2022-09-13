import { useQuery, UseQueryResult, UseQueryOptions, QueryKey, QueryFunction } from 'react-query';
import {
	extractSearchInformation,
	normalizePluginsList,
	normalizePluginData,
} from 'calypso/lib/plugins/utils';
import wpcom from 'calypso/lib/wp';
import { BASE_STALE_TIME } from './constants';

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

export const getFetchWPCOMPlugins = (
	enabled: boolean,
	type: Type,
	searchTerm?: string,
	tag?: string
): [ QueryKey, QueryFunction< { results: Array< { [ plugin: string ]: Plugin } > } > ] => {
	const cacheKey = getCacheKey( type + searchTerm + tag + `${ enabled ? 'enabled' : 'disabled' }` );
	const fetchFn = () => fetchWPCOMPlugins( type, searchTerm, tag );
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
export const useWPCOMPlugins = (
	type: Type,
	searchTerm?: string,
	tag?: string,
	{ enabled = true, staleTime = BASE_STALE_TIME, refetchOnMount = true }: UseQueryOptions = {}
): UseQueryResult => {
	return useQuery( ...getFetchWPCOMPlugins( enabled, type, searchTerm, tag ), {
		select: ( data ) => normalizePluginsList( data.results ),
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
	return useQuery( getCacheKey( slug ), () => fetchWPCOMPlugin( slug ), {
		select: ( data ) => normalizePluginData( { detailsFetched: Date.now() }, data ),
		enabled: enabled,
		staleTime: staleTime,
		refetchOnMount: refetchOnMount,
	} );
};

export const getFetchWPCOMFeaturedPlugins = (): [ QueryKey, QueryFunction< Plugin[] > ] => {
	const cacheKey = 'plugins-featured-list';
	const fetchFn = () =>
		wpcom.req.get( {
			path: featuredPluginsApiBase,
			apiNamespace: pluginsApiNamespace,
		} );
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
	return useQuery( ...getFetchWPCOMFeaturedPlugins(), {
		select: ( data ) => normalizePluginsList( data ),
		enabled,
		staleTime,
		refetchOnMount,
	} );
};
