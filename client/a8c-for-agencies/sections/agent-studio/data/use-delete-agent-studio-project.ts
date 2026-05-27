import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { agentStudioService } from './agent-studio-service';
import { getAgentStudioProjectsQueryKey } from './use-agent-studio-projects';

type Options = UseMutationOptions< void, Error, string >;

export default function useDeleteAgentStudioProject( options?: Options ) {
	const queryClient = useQueryClient();

	return useMutation< void, Error, string >( {
		...options,
		mutationFn: ( projectId ) => agentStudioService.deleteProject( projectId ),
		onSuccess: ( result, projectId, context ) => {
			queryClient.invalidateQueries( { queryKey: getAgentStudioProjectsQueryKey() } );
			options?.onSuccess?.( result, projectId, context );
		},
	} );
}
