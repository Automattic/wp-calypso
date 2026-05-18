import { useQuery } from '@tanstack/react-query';
import { agentStudioService } from './agent-studio-service';
import type { AgentStudioProjectSummary } from '../types';

export const getAgentStudioProjectsQueryKey = () => [ 'a4a-agent-studio-projects' ];

export default function useAgentStudioProjects() {
	return useQuery< AgentStudioProjectSummary[] >( {
		queryKey: getAgentStudioProjectsQueryKey(),
		queryFn: () => agentStudioService.listProjects(),
		refetchOnWindowFocus: false,
	} );
}
