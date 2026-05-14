import { useQuery } from '@tanstack/react-query';
import { useAgentStudioService } from './agent-studio-service';
import type { AgentStudioProject } from '../types';

export const getAgentStudioProjectQueryKey = ( projectId?: string ) => [
	'a4a-agent-studio-project',
	projectId,
];

export default function useAgentStudioProject( projectId?: string ) {
	const service = useAgentStudioService();

	return useQuery< AgentStudioProject | undefined >( {
		queryKey: getAgentStudioProjectQueryKey( projectId ),
		queryFn: () => service.getProject( projectId as string ),
		enabled: !! projectId,
		refetchOnWindowFocus: false,
	} );
}
