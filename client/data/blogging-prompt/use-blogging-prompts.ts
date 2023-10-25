import { Url } from 'url';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import moment from 'moment';
import { addQueryArgs } from 'calypso/lib/url';
import wp from 'calypso/lib/wp';
import { SiteId } from 'calypso/types';
import isBloganuary from './is-bloganuary';

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

export const useBloggingPrompts = (
	siteId: SiteId,
	per_page: number
): UseQueryResult< BloggingPrompt[] | null > => {
	const today = moment().format( '--MM-DD' );
	const januaryDate = '--01-' + moment().format( 'DD' );

	const path = addQueryArgs(
		{
			per_page: per_page,
			after: isBloganuary() ? januaryDate : today,
			order: 'desc',
		},
		`/sites/${ siteId }/blogging-prompts`
	);
	return useQuery( {
		queryKey: [ 'blogging-prompts', siteId, today, per_page, isBloganuary ],
		queryFn: () =>
			wp.req.get( {
				path: path,
				apiNamespace: 'wpcom/v3',
			} ),
		enabled: !! siteId,
		staleTime: 86400000,
	} );
};
