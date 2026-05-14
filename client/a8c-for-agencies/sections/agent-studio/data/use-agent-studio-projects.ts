import { useQuery } from '@tanstack/react-query';
import { useAgentStudioService } from './agent-studio-service';
import type { AgentStudioProjectSummary } from '../types';

export const getAgentStudioProjectsQueryKey = () => [ 'a4a-agent-studio-projects' ];

export default function useAgentStudioProjects() {
	const service = useAgentStudioService();

	return useQuery< AgentStudioProjectSummary[] >( {
		queryKey: getAgentStudioProjectsQueryKey(),
		queryFn: () => service.listProjects(),
		refetchOnWindowFocus: false,
	} );
}
