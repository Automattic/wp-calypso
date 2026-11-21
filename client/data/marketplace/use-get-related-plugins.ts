import {
	useQuery,
	QueryKey,
	QueryFunction,
	UseQueryOptions,
	UseQueryResult,
} from '@tanstack/react-query';
import { normalizePluginData, mapStarRatingToPercent } from 'calypso/lib/plugins/utils';
import wpcom from 'calypso/lib/wp';
import { BASE_STALE_TIME } from 'calypso/state/constants';
import { ESRelatedPluginsResult, RelatedPlugin } from './types';

const mapESDataToReatedPluginData = (
	results: Array< ESRelatedPluginsResult > = []
): RelatedPlugin[] => {
	return results.map( ( result ) => {
		const esPlugin = result.fields;

		const relatedPlugin = normalizePluginData( esPlugin ) as RelatedPlugin;
		relatedPlugin.rating = mapStarRatingToPercent( esPlugin.rating );

		return relatedPlugin;
	} );
};

export const RELATED_PLUGINS_DEFAULT_LIST_SIZE = 4;
export const RELATED_PLUGINS_CAROUSEL_LIST_SIZE = 18;

export const getRelatedPluginsQueryParams = (
	pluginSlug: string,
	size: number
): { queryKey: QueryKey; queryFn: QueryFunction } => {
	const queryKey: QueryKey = [ 'related-plugins', pluginSlug, size ];
	const queryFn = () => {
		return wpcom.req
			.get(
				{
					path: `/marketplace/${ pluginSlug }/related`,
				},
				{ size, apiVersion: '1.3' }
			)
			.then( ( { data }: { data: Array< ESRelatedPluginsResult > } ) =>
				mapESDataToReatedPluginData( data )
			);
	};
	return { queryKey, queryFn };
};

export const useGetRelatedPlugins = (
	pluginSlug: string,
	size = RELATED_PLUGINS_DEFAULT_LIST_SIZE,
	{
		enabled = true,
		staleTime = BASE_STALE_TIME,
		refetchOnMount = true,
	}: Omit< UseQueryOptions, 'queryKey' > = {}
): UseQueryResult => {
	return useQuery( {
		...getRelatedPluginsQueryParams( pluginSlug, size ),
		enabled: enabled,
		staleTime: staleTime,
		refetchOnMount: refetchOnMount,
	} );
};
