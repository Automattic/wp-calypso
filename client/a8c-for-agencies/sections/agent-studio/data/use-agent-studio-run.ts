/**
 * `GET /a4a/runs/<run_id>` — exposes `payload.post_id` once the run
 * completes, plus `current_step` and the input snapshot.
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';

export interface AgentStudioRunPayload {
	post_id?: number;
	agency_blog_id?: number;
	[ key: string ]: unknown;
}

export interface AgentStudioRunResponse {
	run_id: number;
	status: string;
	output_kind: string;
	payload: AgentStudioRunPayload | unknown;
	summary: string;
	artifact_ids: number[];
	cost_cents: number;
	current_step: string;
	input_snapshot: Record< string, unknown >;
	error?: { code: string; message: string };
}

export const getAgentStudioRunQueryKey = ( agencyId: number | undefined, runId: string ) => [
	'a4a-agent-studio-run',
	agencyId,
	runId,
];

// Server-side run statuses that aren't yet terminal. As long as the
// run is in one of these, the deliverable view needs to keep polling
// the runs endpoint so it can pick up the brief once the persist
// ability finishes — otherwise the page would settle on the first
// (empty-payload) response and never recover without a reload.
export const NON_TERMINAL_RUN_STATUSES = new Set( [ 'a4a_pending', 'a4a_running' ] );

const RUN_POLL_INTERVAL_MS = 2000;

// Callers gate on a real agencyId (the hook via `enabled`, the poller via
// its own guard) before this fires.
const fetchAgentStudioRun = (
	agencyId: number | undefined,
	runId: string
): Promise< AgentStudioRunResponse > =>
	wpcom.req.get( {
		apiNamespace: 'wpcom/v2',
		path: `/agency/${ agencyId }/a4a/runs/${ runId }`,
	} );

export default function useAgentStudioRun( runId: string | undefined ) {
	const agencyId = useSelector( getActiveAgencyId );

	const safeRunId = runId ?? '';
	return useQuery< AgentStudioRunResponse >( {
		queryKey: getAgentStudioRunQueryKey( agencyId, safeRunId ),
		queryFn: () => fetchAgentStudioRun( agencyId, safeRunId ),
		enabled: !! agencyId && !! runId,
		refetchOnWindowFocus: false,
		refetchInterval: ( query ) => {
			const status = query.state.data?.status;
			if ( status && NON_TERMINAL_RUN_STATUSES.has( status ) ) {
				return RUN_POLL_INTERVAL_MS;
			}
			return false;
		},
	} );
}

const delay = ( ms: number ) => new Promise< void >( ( resolve ) => setTimeout( resolve, ms ) );

/**
 * Imperative counterpart to the hook for sequential flows (the refine queue):
 * returns a poller that resolves with the run's terminal status, or null when
 * `isCancelled` flips first. Shares the hook's query key (so the cache stays
 * warm), endpoint, terminal set, and interval. A transient fetch failure
 * keeps polling, matching the hook's refetch-interval behavior.
 */
export function useAgentStudioRunPoller() {
	const agencyId = useSelector( getActiveAgencyId );
	const queryClient = useQueryClient();

	return useCallback(
		async ( runId: string, isCancelled: () => boolean ): Promise< string | null > => {
			while ( agencyId && ! isCancelled() ) {
				try {
					const run = await queryClient.fetchQuery< AgentStudioRunResponse >( {
						queryKey: getAgentStudioRunQueryKey( agencyId, runId ),
						queryFn: () => fetchAgentStudioRun( agencyId, runId ),
						staleTime: 0,
					} );
					if ( ! NON_TERMINAL_RUN_STATUSES.has( run.status ) ) {
						return run.status;
					}
				} catch {
					// Transient fetch failure — poll again on the next tick.
				}
				await delay( RUN_POLL_INTERVAL_MS );
			}
			return null;
		},
		[ agencyId, queryClient ]
	);
}
