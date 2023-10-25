import { useQuery, UseQueryResult } from '@tanstack/react-query';
import moment from 'moment';
import { addQueryArgs } from 'calypso/lib/url';
import wp from 'calypso/lib/wp';
import isBloganuary from './is-bloganuary';

export interface BloggingPrompt {
	id: string;
	text: string;
	title: string;
	content: string;
	attribution: string;
	date: string;
	answered: boolean;
	answered_users_count: number;
	answered_users_sample: Array< string >;
}

const selectPrompts = ( response: { prompts: BloggingPrompt[] } ): BloggingPrompt[] | null => {
	const prompts = response && response.prompts;
	if ( ! prompts ) {
		return null;
	}
	return prompts;
};

export const useBloggingPrompts = (
	siteId: string,
	page: number
): UseQueryResult< BloggingPrompt[] | null > => {
	const today = moment().format( 'YYYY-MM-DD' );
	const path = addQueryArgs(
		{
			number: page,
			from: today,
			...( isBloganuary() && { is_bloganuary: true } ),
		},
		`/sites/${ siteId }/blogging-prompts`
	);
	return useQuery( {
		queryKey: [ 'blogging-prompts', today + '-' + page, isBloganuary() ? 'bloganuary' : '' ],
		queryFn: () =>
			wp.req.get( {
				path: path,
				apiNamespace: 'wpcom/v2',
			} ),
		enabled: !! siteId,
		staleTime: 86400000,
		select: selectPrompts,
	} );
};
