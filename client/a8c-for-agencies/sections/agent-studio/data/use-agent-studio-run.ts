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
	} );
}
