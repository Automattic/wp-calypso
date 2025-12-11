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
	if ( hasData ) {
		return 'success';
	}
	if ( isError ) {
		return 'error';
	}
	if ( isLoading ) {
		return 'loading';
	}

	return 'empty';
}

export default function useConversationList( { agentId, authProvider }: Options ): Result {
	const odieQuery = useOdieConversationList();
	const orchestratorQuery = useOrchestratorConversationList( { agentId, authProvider } );

	// Merge and sort conversations by `createdAt` (most recent first)
	const conversations = [ ...odieQuery.conversations, ...orchestratorQuery.conversations ].sort(
		( a, b ) => new Date( b.createdAt ).getTime() - new Date( a.createdAt ).getTime()
	);

	const isLoading = odieQuery.isLoading || orchestratorQuery.isLoading;
	const isError = odieQuery.isError || orchestratorQuery.isError;
	const hasData = conversations.length > 0;

	return {
		conversations,
		status: getStatus( hasData, isError, isLoading ),
	};
}
