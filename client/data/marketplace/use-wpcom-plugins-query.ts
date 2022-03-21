import { useQuery, UseQueryResult, UseQueryOptions, QueryKey } from 'react-query';
import {
	extractSearchInformation,
	normalizePluginsList,
	normalizePluginData,
} from 'calypso/lib/plugins/utils';
import wpcom from 'calypso/lib/wp';

type Type = 'all' | 'featured';

const plugisApiBase = '/marketplace/products';
const featuredPluginsApiBase = '/plugins/featured';
const pluginsApiNamespace = 'wpcom/v2';

const baseStaleTime = 1000 * 60 * 60 * 2; // 2h

const getCacheKey = ( key: string ): QueryKey => [ 'wpcom-plugins', key ];

const fetchWPCOMPlugins = ( type: Type, searchTerm?: string ) => {
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
		}
	);
};

/**
 * Returns marketplace plugins list filtered by searchterm and type.
 *
 * @param {Type} type Optional The query type
 * @param {string} searchTerm Optional The term to search for
 * @param {{enabled: boolean, staleTime: number, refetchOnMount: boolean}} {} Optional options to pass to the underlying query engine
 * @returns {{ data, error, isLoading: boolean ...}} Returns various parameters piped from `useQuery`
 */
export const useWPCOMPlugins = (
	type: Type,
	searchTerm?: string,
	{ enabled = true, staleTime = baseStaleTime, refetchOnMount = true }: UseQueryOptions = {}
): UseQueryResult => {
	return useQuery( getCacheKey( type + searchTerm ), () => fetchWPCOMPlugins( type, searchTerm ), {
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
	{ enabled = true, staleTime = baseStaleTime, refetchOnMount = true }: UseQueryOptions = {}
): UseQueryResult< any > => {
	return useQuery( getCacheKey( slug ), () => fetchWPCOMPlugin( slug ), {
		select: ( data ) => normalizePluginData( { detailsFetched: Date.now() }, data ),
		enabled: enabled,
		staleTime: staleTime,
		refetchOnMount: refetchOnMount,
	} );
};

/**
 * Returns the featured list of plugins from WPCOM
 *
 * @param {{enabled: boolean, staleTime: number, refetchOnMount: boolean}} {} Optional options to pass to the underlying query engine
 * @returns {{ data, error, isLoading: boolean ...}} Returns various parameters piped from `useQuery`
 */
export const useWPCOMFeaturedPlugins = ( {
	enabled = true,
	staleTime = baseStaleTime,
	refetchOnMount = true,
}: UseQueryOptions = {} ): UseQueryResult => {
	return useQuery(
		'plugins-featured-list',
		() =>
			wpcom.req.get( {
				path: featuredPluginsApiBase,
				apiNamespace: pluginsApiNamespace,
			} ),
		{
			select: ( data ) => normalizePluginsList( data ),
			enabled,
			staleTime,
			refetchOnMount,
		}
	);
};
