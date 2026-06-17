import { useCallback } from 'react';
import useAgentStudioOutputs, {
	type AgentStudioOutputsPollPredicate,
} from './use-agent-studio-outputs';

export default function useAgentStudioOutput( outputId: string ) {
	// Detail view only cares about its own row. Without this scoping
	// the shared outputs query polls every 2s whenever ANY row in the
	// list is `generating` — even unrelated ones — keeping the
	// heartbeat alive while the user sits on a finished output.
	const pollPredicate = useCallback< AgentStudioOutputsPollPredicate >(
		( outputs ) =>
			outputs?.find( ( candidate ) => candidate.id === outputId )?.status === 'generating',
		[ outputId ]
	);
	const query = useAgentStudioOutputs( { pollPredicate } );
	const output = query.data?.find( ( candidate ) => candidate.id === outputId );

	return {
		data: output,
		isLoading: query.isLoading,
		isError: query.isError,
	};
}
