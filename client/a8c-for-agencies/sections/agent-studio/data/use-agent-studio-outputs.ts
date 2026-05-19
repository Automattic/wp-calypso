import { useQuery } from '@tanstack/react-query';
import { agentStudioService } from './agent-studio-service';
import type { AgentStudioOutput } from '../types';

export const getAgentStudioOutputsQueryKey = () => [ 'a4a-agent-studio-outputs' ];

export default function useAgentStudioOutputs() {
	return useQuery< AgentStudioOutput[] >( {
		queryKey: getAgentStudioOutputsQueryKey(),
		queryFn: () => agentStudioService.listOutputs(),
		refetchOnWindowFocus: false,
	} );
}
