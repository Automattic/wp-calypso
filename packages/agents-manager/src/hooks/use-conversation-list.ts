import { useMemo } from '@wordpress/element';
import useOdieConversationList from './use-odie-conversation-list';
import useOrchestratorConversationList from './use-orchestrator-conversation-list';
import type { Conversation } from '../types';

interface Options {
	agentId: string;
	authProvider?: () => Promise< Record< string, string > >;
}

type Status = 'loading' | 'error' | 'empty' | 'success';

interface Result {
	conversations: Conversation[];
	status: Status;
}

function getStatus( hasData: boolean, isError: boolean, isLoading: boolean ): Status {
	if ( isError ) {
		return 'error';
	}
	if ( isLoading ) {
		return 'loading';
	}
	if ( hasData ) {
		return 'success';
	}

	return 'empty';
}

export default function useConversationList( { agentId, authProvider }: Options ): Result {
	const odieQuery = useOdieConversationList();
	const orchestratorQuery = useOrchestratorConversationList( { agentId, authProvider } );
	// TODO: Integrate Zendesk conversation list...

	// Merge and sort conversations by `createdAt` (most recent first)
	const conversations = useMemo(
		() =>
			[ ...odieQuery.conversations, ...orchestratorQuery.conversations ].sort(
				( a, b ) => b.createdAt - a.createdAt
			),
		[ odieQuery.conversations, orchestratorQuery.conversations ]
	);

	const isLoading = odieQuery.isLoading || orchestratorQuery.isLoading;
	const isError = odieQuery.isError || orchestratorQuery.isError;
	const hasData = conversations.length > 0;

	return {
		conversations,
		status: getStatus( hasData, isError, isLoading ),
	};
}
