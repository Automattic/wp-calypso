import { useQuery, UseQueryResult } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { SiteId } from 'calypso/types';

export interface AIBloggingPrompt {
	title: string;
}

export function mapAIPromptToRegularPrompt( aiPrompt: AIBloggingPrompt ) {
	return {
		id: 0,
		label: aiPrompt.title,
		text: aiPrompt.title,
		attribution: 'jetpack-ai',
		answered: false,
		answered_users_count: 0,
		answered_users_sample: [],
	};
}

export const isAIBLoggingPrompt = ( prompt: any ) => prompt.attribution === 'jetpack-ai';

export const useAIBloggingPrompts = (
	siteId: SiteId
): UseQueryResult< AIBloggingPrompt[] | null > => {
	const path = `/sites/${ siteId }/jetpack-ai/blogging/prompts`;

	return useQuery( {
		queryKey: [ 'ai-blogging-prompts', siteId ],
		queryFn: () =>
			wp.req.get( {
				path: path,
				apiNamespace: 'wpcom/v2',
			} ),
		enabled: !! siteId,
		staleTime: 86400000,
	} );
};
