import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { agentStudioService } from './agent-studio-service';
import { getAgentStudioOutputsQueryKey } from './use-agent-studio-outputs';

type Options = UseMutationOptions< void, Error, string >;

export default function useDeleteAgentStudioOutput( options?: Options ) {
	const queryClient = useQueryClient();

	return useMutation< void, Error, string >( {
		...options,
		mutationFn: ( outputId ) => agentStudioService.deleteOutput( outputId ),
		onSuccess: ( result, outputId, context ) => {
			queryClient.invalidateQueries( { queryKey: getAgentStudioOutputsQueryKey() } );
			options?.onSuccess?.( result, outputId, context );
		},
	} );
}
