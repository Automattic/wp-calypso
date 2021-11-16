import { useQuery, UseQueryResult, UseQueryOptions, QueryKey } from 'react-query';
import { normalizePluginsList, normalizePluginData } from 'calypso/lib/plugins/utils';
import wpcom from 'calypso/lib/wp';

type Type = 'all' | 'featured';

const plugisApiBase = '/marketplace/products';
const pluginsApiNamespace = 'wpcom/v2';

const getCacheKey = ( key: string ): QueryKey => [ 'wpcom-plugins', key ];

const fetchWPCOMPlugins = ( type: Type, searchTerm?: string ) => {
	return wpcom.req.get(
		{
			path: plugisApiBase,
			apiNamespace: pluginsApiNamespace,
		},
		{
			q: searchTerm,
			type: type,
		}
	);
};

/**
 * Returns marketplace plugins list filtered by searchterm and type.
 *
 * @param {Type} type Optional The query type
 * @param {string} searchTerm Optional The term to search for
 * @param {object} {} Optional options to pass to the underlying query engine
 * @returns {{ data, error, isLoading: boolean ...}} Returns various parameters piped from `useQuery`
 */
export const useWPCOMPlugins = (
	type: Type,
	searchTerm?: string,
	{ enabled = true, staleTime = 1000 * 60 * 60 * 24, refetchOnMount = false }: UseQueryOptions = {}
): UseQueryResult => {
	return useQuery( getCacheKey( type ), () => fetchWPCOMPlugins( type, searchTerm ), {
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
 * @param {object} {} Optional options to pass to the underlying query engine
 * @returns {{ data, error, isLoading: boolean ...}} Returns various parameters piped from `useQuery`
 */
export const useWPCOMPlugin = (
	slug: string,
	{ enabled = true, staleTime = 1000 * 60 * 60 * 24, refetchOnMount = false }: UseQueryOptions = {}
): UseQueryResult => {
	return useQuery( getCacheKey( slug ), () => fetchWPCOMPlugin( slug ), {
		select: ( data ) => normalizePluginData( { detailsFetched: Date.now() }, data ),
		enabled: enabled,
		staleTime: staleTime,
		refetchOnMount: refetchOnMount,
	} );
};
