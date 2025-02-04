import { Url } from 'url';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { addQueryArgs } from 'calypso/lib/url';
import wp from 'calypso/lib/wp';
import { getMyPostCounts } from 'calypso/state/posts/counts/selectors';
import { SiteId } from 'calypso/types';

export interface BloggingPrompt {
	id: number;
	label: string;
	text: string;
	attribution: string;
	date: string;
	answered: boolean;
	answered_users_count: number;
	answered_users_sample: AnsweredUsersSample[];
	answered_link: Url;
	answered_link_text: string;
}

interface AnsweredUsersSample {
	avatar: Url;
}
interface PublishedPosts {
	publish: string;
}

export const useBloggingPrompts = (
	siteId: SiteId,
	start_date: string,
	per_page: number
): UseQueryResult< BloggingPrompt[] | null > => {
	const path = addQueryArgs(
		{
			per_page: per_page,
			after: start_date,
			order: 'desc',
			force_year: new Date().getFullYear(),
		},
		`/sites/${ siteId }/blogging-prompts`
	);
	// if a new post is published, we want the cache to be invalidated
	const publishedPosts = useSelector( ( state: object ) =>
		getMyPostCounts( state, siteId, 'post' )
	) as PublishedPosts;

	return useQuery( {
		queryKey: [
			'blogging-prompts',
			siteId,
			start_date,
			per_page,
			'posts-' + publishedPosts?.publish,
		],
		queryFn: () =>
			wp.req.get( {
				path: path,
				apiNamespace: 'wpcom/v3',
			} ),
		enabled: !! siteId,
		staleTime: 86400000,
	} );
};
