/**
 * `GET /a4a/runs/<run_id>` — exposes `payload.post_id` once the run
 * completes, plus `current_step` and the input snapshot.
 */
import { useQuery } from '@tanstack/react-query';
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

export default function useAgentStudioRun( runId: string | undefined ) {
	const agencyId = useSelector( getActiveAgencyId );

	const safeRunId = runId ?? '';
	return useQuery< AgentStudioRunResponse >( {
		queryKey: getAgentStudioRunQueryKey( agencyId, safeRunId ),
		queryFn: () =>
			wpcom.req.get( {
				apiNamespace: 'wpcom/v2',
				path: `/agency/${ agencyId }/a4a/runs/${ safeRunId }`,
			} ),
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
