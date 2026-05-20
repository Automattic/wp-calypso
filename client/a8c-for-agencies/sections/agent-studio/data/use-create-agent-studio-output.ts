import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { agentStudioService } from './agent-studio-service';
import { getAgentStudioOutputsQueryKey } from './use-agent-studio-outputs';
import type { AgentStudioOutput, CreateAgentStudioOutputInput } from '../types';

type Options = UseMutationOptions< AgentStudioOutput, Error, CreateAgentStudioOutputInput >;

export default function useCreateAgentStudioOutput( options?: Options ) {
	const queryClient = useQueryClient();

	return useMutation< AgentStudioOutput, Error, CreateAgentStudioOutputInput >( {
		...options,
		mutationFn: ( input ) => agentStudioService.createOutput( input ),
		onSuccess: ( output, variables, context ) => {
			queryClient.invalidateQueries( { queryKey: getAgentStudioOutputsQueryKey() } );
			options?.onSuccess?.( output, variables, context );
		},
	} );
}
