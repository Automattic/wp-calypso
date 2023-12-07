import { isEnabled } from '@automattic/calypso-config';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { SiteId } from 'calypso/types';

export interface AIBloggingPrompt {
	title: string;
}

function mapAIPromptToRegularPrompt( aiPrompt: AIBloggingPrompt ) {
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

export function mergePromptStreams( regularPrompts: any, aiPrompts: any ) {
	if ( ! aiPrompts || ! Array.isArray( aiPrompts.prompts ) ) {
		return regularPrompts;
	}
	const aiPromptRatio = 3; // 1 out of 3 prompts will be AI prompts.
	const mappedAIPrompts = aiPrompts.prompts.map( mapAIPromptToRegularPrompt );
	// Insert AI prompts into the prompts array every aiPromptRatio prompts.
	const prompts = [];

	for ( let i = 0; i < regularPrompts.length; i++ ) {
		prompts.push( regularPrompts[ i ] );
		if ( i % aiPromptRatio === 0 && mappedAIPrompts[ i / aiPromptRatio ] ) {
			prompts.push( mappedAIPrompts[ i / aiPromptRatio ] );
		}
	}
	return prompts;
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
		enabled: isEnabled( 'calypso/ai-blogging-prompts' ) && !! siteId,
		staleTime: 86400000,
		retry: false,
	} );
};
