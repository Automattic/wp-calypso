import apiFetch from '@wordpress/api-fetch';
import { useQuery } from 'react-query';
import { SearchResult } from '../types';

interface APIFetchOptions {
	global: boolean;
	path: string;
}

export const useHelpSearchQuery = (
	search: string,
	locale = 'en',
	queryOptions: Record< string, unknown > = {}
) => {
	return useQuery< SearchResult[] >(
		[ 'help', search ],
		() =>
			apiFetch( {
				global: true,
				path: `/wpcom/v2/help-center/search?query=${ search }&locale=${ locale }`,
			} as APIFetchOptions ),
		{
			refetchOnWindowFocus: false,
			refetchOnMount: false,
			enabled: !! search,
			...queryOptions,
		}
	);
};
