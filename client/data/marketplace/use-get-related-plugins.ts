import {
	useQuery,
	QueryKey,
	QueryFunction,
	UseQueryOptions,
	UseQueryResult,
} from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { BASE_STALE_TIME } from 'calypso/state/initial-state';

const getRelatedPluginsQueryParams = (
	pluginSlug: string,
	size: number
): { queryKey: QueryKey; queryFn: QueryFunction } => {
	const queryKey: QueryKey = [ 'related-plugins', pluginSlug, size ];
	const queryFn = () => {
		return wpcom.req.get(
			{
				path: `/marketplace/${ pluginSlug }/related`,
				apiNamespace: 'rest/v1.3',
			},
			{ size }
		);
	};
	return { queryKey, queryFn };
};

export const useGetRelatedPlugins = (
	pluginSlug: string,
	size = 4,
	{ enabled = true, staleTime = BASE_STALE_TIME, refetchOnMount = true }: UseQueryOptions = {}
): UseQueryResult => {
	return useQuery( {
		...getRelatedPluginsQueryParams( pluginSlug, size ),
		enabled: enabled,
		staleTime: staleTime,
		refetchOnMount: refetchOnMount,
	} );
};
