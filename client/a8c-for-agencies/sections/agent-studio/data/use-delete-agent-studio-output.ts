import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { agentStudioService } from './agent-studio-service';
import { getAgentStudioOutputsQueryKey } from './use-agent-studio-outputs';

type Options = UseMutationOptions< void, Error, string >;

export default function useDeleteAgentStudioOutput( options?: Options ) {
	const queryClient = useQueryClient();
	const agencyId = useSelector( getActiveAgencyId );

	return useMutation< void, Error, string >( {
		...options,
		mutationFn: ( outputId ) => agentStudioService.deleteOutput( outputId, agencyId ),
		onSuccess: ( result, outputId, context ) => {
			queryClient.invalidateQueries( { queryKey: getAgentStudioOutputsQueryKey( agencyId ) } );
			options?.onSuccess?.( result, outputId, context );
		},
	} );
}
