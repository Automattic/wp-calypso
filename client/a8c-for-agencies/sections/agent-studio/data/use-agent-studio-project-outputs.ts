import { useQuery } from '@tanstack/react-query';
import { agentStudioService } from './agent-studio-service';
import type { AgentStudioOutput } from '../types';

export const getAgentStudioProjectOutputsQueryKey = ( projectId?: string ) => [
	'a4a-agent-studio-project-outputs',
	projectId,
];

export default function useAgentStudioProjectOutputs( projectId?: string ) {
	return useQuery< AgentStudioOutput[] >( {
		queryKey: getAgentStudioProjectOutputsQueryKey( projectId ),
		queryFn: () => agentStudioService.listProjectOutputs( projectId as string ),
		enabled: !! projectId,
		refetchOnWindowFocus: false,
	} );
}
