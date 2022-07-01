import { useLocale } from '@automattic/i18n-utils';
import { useQuery } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { LinksForSection } from '@automattic/data-stores';

interface APIResponse {
	search_results: {
		wordpress_support_links: LinksForSection[];
	};
}

export const useHelpSearchQuery = (
	search: string,
	queryOptions: Record< string, unknown > = {}
) => {
	const locale = useLocale();
	const params = new URLSearchParams( {
		include_post_id: '1',
		locale,
	} );

	if ( search ) {
		params.append( 'query', search );
	}

	return useQuery< { wordpress_support_links: LinksForSection[] } >(
		[ 'help', search ],
		() =>
			wpcomRequest< APIResponse >( {
				path: 'help-center/search',
				query: params.toString(),
				apiNamespace: 'wpcom/v2/',
				apiVersion: '2',
			} ).then( ( response ) => response?.search_results ),
		{
			enabled: !! search,
			...queryOptions,
		}
	);
};
