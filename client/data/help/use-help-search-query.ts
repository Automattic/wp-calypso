import { useLocale } from '@automattic/i18n-utils';
import { useQuery } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { LinksForSection } from '@automattic/data-stores';
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
		() => wpcomRequest( { path: '/help/search', query: params.toString(), apiVersion: '1.1' } ),
		{
			enabled: !! search,
			...queryOptions,
		}
	);
};
