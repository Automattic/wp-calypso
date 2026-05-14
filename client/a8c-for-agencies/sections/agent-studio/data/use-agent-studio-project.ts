import { useQuery } from '@tanstack/react-query';
import { agentStudioService } from './agent-studio-service';
import type { AgentStudioProject } from '../types';

export const getAgentStudioProjectQueryKey = ( projectId?: string ) => [
	'a4a-agent-studio-project',
	projectId,
];

export default function useAgentStudioProject( projectId?: string ) {
	return useQuery< AgentStudioProject | undefined >( {
		queryKey: getAgentStudioProjectQueryKey( projectId ),
		queryFn: () => agentStudioService.getProject( projectId as string ),
		enabled: !! projectId,
		refetchOnWindowFocus: false,
	} );
}
