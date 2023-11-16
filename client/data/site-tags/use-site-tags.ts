import { useQuery, UseQueryResult } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { SiteId, URL } from 'calypso/types';

interface Tag {
	id: number;
	count: number;
	description: string;
	link: URL;
	name: string;
	slug: string;
	taxonomy: 'post_tag';
	meta: Array< unknown >;
}

export const useSiteTags = ( siteId: SiteId ): UseQueryResult< Tag[] | null > =>
	useQuery( {
		enabled: !! siteId,
		queryKey: [ 'site-tags', siteId ],
		queryFn: () =>
			wp.req.get( `/sites/${ siteId }/tags?order=desc&orderby=count&per_page=10`, {
				apiNamespace: 'wp/v2',
			} ),
		staleTime: 3600000, // 1 hour
	} );
