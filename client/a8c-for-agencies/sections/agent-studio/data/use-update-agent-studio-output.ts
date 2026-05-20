import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { agentStudioService } from './agent-studio-service';
import { getAgentStudioOutputsQueryKey } from './use-agent-studio-outputs';
import type { AgentStudioOutput, UpdateAgentStudioOutputInput } from '../types';

export interface UpdateAgentStudioOutputArgs {
	outputId: string;
	updates: UpdateAgentStudioOutputInput;
}

type Options = UseMutationOptions<
	AgentStudioOutput | undefined,
	Error,
	UpdateAgentStudioOutputArgs
>;

export default function useUpdateAgentStudioOutput( options?: Options ) {
	const queryClient = useQueryClient();
	return useMutation< AgentStudioOutput | undefined, Error, UpdateAgentStudioOutputArgs >( {
		...options,
		mutationFn: ( { outputId, updates } ) => agentStudioService.updateOutput( outputId, updates ),
		onSuccess: ( output, variables, context ) => {
			queryClient.invalidateQueries( { queryKey: getAgentStudioOutputsQueryKey() } );
			options?.onSuccess?.( output, variables, context );
		},
	} );
}
