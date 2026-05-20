import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { agentStudioService } from './agent-studio-service';
import type { AgentStudioOutput } from '../types';

export const getAgentStudioOutputsQueryKey = ( agencyId: number | undefined ) => [
	'a4a-agent-studio-outputs',
	agencyId,
];

export default function useAgentStudioOutputs() {
	const agencyId = useSelector( getActiveAgencyId );

	return useQuery< AgentStudioOutput[] >( {
		queryKey: getAgentStudioOutputsQueryKey( agencyId ),
		queryFn: () => agentStudioService.listOutputs( agencyId as number ),
		enabled: !! agencyId,
		refetchOnWindowFocus: false,
		// Poll while a deliverable is generating so the card flips to ready
		// without the agency having to reload the page.
		refetchInterval: ( query ) =>
			query.state.data?.some( ( output ) => output.status === 'generating' ) ? 2000 : false,
	} );
}
