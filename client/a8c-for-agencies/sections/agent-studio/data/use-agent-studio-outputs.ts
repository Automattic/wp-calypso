import { useQuery } from '@tanstack/react-query';
import { agentStudioService } from './agent-studio-service';
import type { AgentStudioOutput } from '../types';

export const getAgentStudioOutputsQueryKey = () => [ 'a4a-agent-studio-outputs' ];

export default function useAgentStudioOutputs() {
	return useQuery< AgentStudioOutput[] >( {
		queryKey: getAgentStudioOutputsQueryKey(),
		queryFn: () => agentStudioService.listOutputs(),
		refetchOnWindowFocus: false,
		// Poll while a deliverable is generating so the card flips to ready
		// without the agency having to reload the page.
		refetchInterval: ( query ) =>
			query.state.data?.some( ( output ) => output.status === 'generating' ) ? 2000 : false,
	} );
}
