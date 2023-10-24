import { Url } from 'url';
import { isEnabled } from '@automattic/calypso-config';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import moment from 'moment';
import wp from 'calypso/lib/wp';
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

export const useBloggingPrompts = (
	siteId: SiteId,
	per_page: number
): UseQueryResult< BloggingPrompt[] | null > => {
	const isBloganuary = isEnabled( 'bloganuary' );
	const today = moment().format( '--MM-DD' );
	const januaryDate = '--01-' + moment().format( 'DD' );

	const dateArg = isBloganuary ? januaryDate : today;

	return useQuery( {
		queryKey: [ 'blogging-prompts', siteId, today, per_page, isBloganuary ],
		queryFn: () =>
			wp.req.get( {
				path: `/sites/${ siteId }/blogging-prompts?per_page=${ per_page }&after=${ dateArg }&order=desc`,
				apiNamespace: 'wpcom/v3',
			} ),
		enabled: !! siteId,
		staleTime: 86400000,
	} );
};
