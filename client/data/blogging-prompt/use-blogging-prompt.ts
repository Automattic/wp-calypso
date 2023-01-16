import moment from 'moment';
import { useQuery, UseQueryResult } from 'react-query';
import wp from 'calypso/lib/wp';

export interface BloggingPrompt {
	id: string;
	text: string;
	answered: boolean;
	answered_users_count: number;
	answered_users_sample: [ string ];
}

const selectPrompts = ( response: any ): [ BloggingPrompt ] | null => {
	const prompts = response && response.prompts;
	if ( ! prompts ) {
		return null;
	}
	return prompts.map(
		( prompt: any ): BloggingPrompt => ( {
			id: prompt.id,
			text: prompt.text,
			answered: prompt.answered,
			answered_users_count: prompt.answered_users_count,
			answered_users_sample: prompt.answered_users_sample,
		} )
	);
};

export const useBloggingPrompts = (
	siteId: string,
	page: number
): UseQueryResult< [ BloggingPrompt ] | null > => {
	const today = moment().format( 'YYYY-MM-DD' );

	return useQuery(
		// Blogging prompts are the same for all sites, so can be cached only by date.
		[ 'blogging-prompts', today + '-' + page + 1 ],
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
