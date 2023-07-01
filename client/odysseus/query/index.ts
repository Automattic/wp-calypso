import { useQuery, useMutation, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { Nudge, useOdysseusAssistantContext } from '../context';

function queryValidate( siteId: number | null ) {
	const path = `/sites/${ siteId }/odysseus`;
	return wpcom.req.get( { path, apiNamespace: 'wpcom/v2' } );
}

export type Message = {
	text: string;
	sender: 'user' | 'wapuu';
};

export const useOddyseusEndpointValidation = ( siteId: number | null ) => {
	return useQuery( {
		queryKey: [ 'oddyseus-assistante-validation', siteId ],
		queryFn: () => queryValidate( siteId ),
		staleTime: 5 * 60 * 1000,
		enabled: siteId !== null,
	} );
};

function postOddyseus(
	siteId: number | null,
	prompt: string,
	context: Nudge,
	messages: Message[] = [],
	sectionName: string
) {
	const path = `/sites/${ siteId }/odysseus`;
	return wpcom.req.post( {
		path,
		apiNamespace: 'wpcom/v2',
		body: { prompt, context, messages, sectionName },
	} );
}

export const useOddyseusEndpointPost = (
	siteId: number | null
): UseMutationResult<
	string,
	unknown,
	{ prompt: string; context: Nudge; messages: Message[] }
> => {
	const { sectionName } = useOdysseusAssistantContext();

	return useMutation( {
		mutationFn: ( {
			prompt,
			context,
			messages,
		}: {
			prompt: string;
			context: Nudge;
			messages: Message[];
		} ) => postOddyseus( siteId, prompt, context, messages, sectionName ),
	} );
};
