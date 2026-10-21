import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { agentStudioService } from './agent-studio-service';
import { getAgentStudioOutputsQueryKey } from './use-agent-studio-outputs';
import type { AgentStudioOutput, CreateAgentStudioOutputInput } from '../types';

type Options = UseMutationOptions< AgentStudioOutput, Error, CreateAgentStudioOutputInput >;

export default function useCreateAgentStudioOutput( options?: Options ) {
	const queryClient = useQueryClient();
	const agencyId = useSelector( getActiveAgencyId );

	return useMutation< AgentStudioOutput, Error, CreateAgentStudioOutputInput >( {
		...options,
		mutationFn: ( input ) => agentStudioService.createOutput( input, agencyId ),
		onSuccess: ( output, variables, context ) => {
			const queryKey = getAgentStudioOutputsQueryKey( agencyId );
			queryClient.setQueryData< AgentStudioOutput[] >( queryKey, ( current = [] ) => {
				if ( current.some( ( candidate ) => candidate.id === output.id ) ) {
					return current;
				}
				return [ output, ...current ];
			} );
			queryClient.invalidateQueries( { queryKey } );
			options?.onSuccess?.( output, variables, context );
		},
	} );
}
