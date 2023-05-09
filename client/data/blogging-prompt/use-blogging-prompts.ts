import { useQuery, UseQueryResult } from '@tanstack/react-query';
import moment from 'moment';
import wp from 'calypso/lib/wp';

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

	return useQuery(
		// Blogging prompts are the same for all sites, so can be cached only by date.
		[ 'blogging-prompts', today + '-' + page ],
		() =>
			wp.req.get( {
				path: `/sites/${ siteId }/blogging-prompts?number=${ page }&from=${ today }`,
				apiNamespace: 'wpcom/v2',
			} ),
		{
			enabled: !! siteId,
			staleTime: 86400000, // 1 day
			select: selectPrompts,
		}
	);
};
