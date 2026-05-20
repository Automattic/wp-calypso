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
		mutationFn: ( input ) => {
			if ( ! agencyId ) {
				return Promise.reject( new Error( 'Missing agency id' ) );
			}
			return agentStudioService.createOutput( agencyId, input );
		},
		onSuccess: ( output, variables, context ) => {
			queryClient.invalidateQueries( { queryKey: getAgentStudioOutputsQueryKey( agencyId ) } );
			options?.onSuccess?.( output, variables, context );
		},
	} );
}
