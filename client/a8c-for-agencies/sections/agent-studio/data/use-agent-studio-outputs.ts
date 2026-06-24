import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { agentStudioService } from './agent-studio-service';
import type { AgentStudioOutput } from '../types';

export const getAgentStudioOutputsQueryKey = ( agencyId?: number ) => [
	'a4a-agent-studio-outputs',
	agencyId,
];

export type AgentStudioOutputsPollPredicate = (
	outputs: AgentStudioOutput[] | undefined
) => boolean;

const defaultPollPredicate: AgentStudioOutputsPollPredicate = ( outputs ) =>
	!! outputs?.some( ( output ) => output.status === 'generating' );

interface UseAgentStudioOutputsOptions {
	/**
	 * Decides whether to keep polling the outputs list every 2s. The
	 * default polls whenever any output is in `generating`. Consumers
	 * that only care about one row (e.g. the detail page) can narrow
	 * this so an unrelated stuck `generating` row doesn't keep the
	 * 2s heartbeat alive while the user sits on a finished page.
	 */
	pollPredicate?: AgentStudioOutputsPollPredicate;
}

export default function useAgentStudioOutputs( options: UseAgentStudioOutputsOptions = {} ) {
	const agencyId = useSelector( getActiveAgencyId );
	const pollPredicate = options.pollPredicate ?? defaultPollPredicate;

	return useQuery< AgentStudioOutput[] >( {
		queryKey: getAgentStudioOutputsQueryKey( agencyId ),
		queryFn: () => agentStudioService.listOutputs( agencyId ),
		enabled: !! agencyId,
		refetchOnWindowFocus: false,
		// Tab-hidden pause is handled by `refetchIntervalInBackground: false`.
		refetchInterval: ( query ) => ( pollPredicate( query.state.data ) ? 2000 : false ),
		refetchIntervalInBackground: false,
	} );
}
