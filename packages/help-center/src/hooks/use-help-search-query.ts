import apiFetch from '@wordpress/api-fetch';
import { useQuery } from 'react-query';
import type { LinksForSection } from '@automattic/data-stores';

interface APIFetchOptions {
	global: boolean;
	path: string;
}

export const useHelpSearchQuery = (
	search: string,
	locale = 'en',
	queryOptions: Record< string, unknown > = {}
) => {
	return useQuery< { wordpress_support_links: LinksForSection[] } >(
		[ 'help', search ],
		() =>
			apiFetch( {
				global: true,
				path: `/wpcom/v2/help-center/search?query=${ search }&locale=${ locale }`,
			} as APIFetchOptions ),
		{
			enabled: !! search,
			...queryOptions,
		}
	);
};
