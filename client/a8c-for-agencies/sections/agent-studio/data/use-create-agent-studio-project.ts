import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { agentStudioService } from './agent-studio-service';
import { getAgentStudioProjectQueryKey } from './use-agent-studio-project';
import { getAgentStudioProjectsQueryKey } from './use-agent-studio-projects';
import type {
	AgentStudioProject,
	CreateAgentStudioProjectInput,
} from 'calypso/a8c-for-agencies/sections/agent-studio/types';

type Options = UseMutationOptions< AgentStudioProject, Error, CreateAgentStudioProjectInput >;

export default function useCreateAgentStudioProject( options?: Options ) {
	const queryClient = useQueryClient();

	return useMutation< AgentStudioProject, Error, CreateAgentStudioProjectInput >( {
		...options,
		mutationFn: ( input ) => agentStudioService.createProject( input ),
		onSuccess: ( project, variables, context ) => {
			queryClient.setQueryData( getAgentStudioProjectQueryKey( project.id ), project );
			queryClient.invalidateQueries( { queryKey: getAgentStudioProjectsQueryKey() } );
			options?.onSuccess?.( project, variables, context );
		},
	} );
}
