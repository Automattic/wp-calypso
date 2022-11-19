import moment from 'moment';
import { useQuery, UseQueryResult } from 'react-query';
import wp from 'calypso/lib/wp';
import { BloggingPrompt } from './blogging-prompt';

const selectPrompt = ( response: any ): BloggingPrompt | null => {
	const prompt = response && response.prompts && response.prompts[ 0 ];
	if ( ! prompt ) {
		return null;
	}
	return {
		id: prompt.id,
		text: prompt.text,
	};
};

const useBloggingPrompt = ( siteId: string ): UseQueryResult< BloggingPrompt | null > => {
	const today = moment().format( 'YYYY-MM-DD' );

	return useQuery(
		[ 'blogging-prompts', siteId, today ],
		() =>
			wp.req.get( {
				path: `/sites/${ siteId }/blogging-prompts?number=1&from=${ today }`,
				apiNamespace: 'wpcom/v2',
			} ),
		{
			enabled: !! siteId,
			staleTime: 86400000, // 1 day
			select: selectPrompt,
		}
	);
};

export default useBloggingPrompt;
