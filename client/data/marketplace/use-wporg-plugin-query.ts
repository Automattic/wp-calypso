import { useQuery, UseQueryResult, UseQueryOptions, QueryKey } from 'react-query';
import { useSelector } from 'react-redux';
import { extractSearchInformation, normalizePluginsList } from 'calypso/lib/plugins/utils';
import { fetchPluginsList } from 'calypso/lib/wporg';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';

type WPORGOptionsType = {
	pageSize?: number;
	page?: number;
	category?: string;
	searchTerm?: string;
	locale: string;
};

const getCacheKey = ( key: string ): QueryKey => [ 'wporg-plugins', key ];

const getPluginsListKey = ( options: WPORGOptionsType ): QueryKey =>
	getCacheKey(
		`${ options.category || '' }_${ options.searchTerm || '' }_${ options.page || '' }_${
			options.pageSize || ''
		}_${ options.locale || '' }`
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
