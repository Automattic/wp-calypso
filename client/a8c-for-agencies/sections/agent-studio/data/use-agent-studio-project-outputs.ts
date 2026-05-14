import { useQuery } from '@tanstack/react-query';
import { useAgentStudioService } from './agent-studio-service';
import type { AgentStudioOutput } from '../types';

export const getAgentStudioProjectOutputsQueryKey = ( projectId?: string ) => [
	'a4a-agent-studio-project-outputs',
	projectId,
];

export default function useAgentStudioProjectOutputs( projectId?: string ) {
	const service = useAgentStudioService();

	return useQuery< AgentStudioOutput[] >( {
		queryKey: getAgentStudioProjectOutputsQueryKey( projectId ),
		queryFn: () => service.listProjectOutputs( projectId as string ),
		enabled: !! projectId,
		refetchOnWindowFocus: false,
	} );
}
