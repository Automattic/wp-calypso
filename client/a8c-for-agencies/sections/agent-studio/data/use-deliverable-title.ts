/**
 * Resolves the human title for a deliverable card.
 *
 * The outputs endpoint returns a machine-generated run title
 * (`Recipe run — <recipe>`). The heading the user actually typed in the
 * brief lives in the run's `input_snapshot` (`title` for one-pagers,
 * `headline` for social) and is present even while the run is still
 * generating, so we fetch the run and prefer it.
 */
import useAgentStudioRun, { type AgentStudioRunResponse } from './use-agent-studio-run';
import type { AgentStudioOutput } from '../types';

const SOCIAL_DELIVERABLE_TYPE = 'social-assets';

const readString = ( value: unknown ): string | undefined =>
	typeof value === 'string' && value.trim() ? value.trim() : undefined;

export function resolveDeliverableTitle(
	output: AgentStudioOutput,
	run?: AgentStudioRunResponse
): string {
	const snapshot = run?.input_snapshot;
	const snapshotKey = output.deliverableType === SOCIAL_DELIVERABLE_TYPE ? 'headline' : 'title';
	return readString( snapshot?.[ snapshotKey ] ) ?? output.title;
}

export default function useDeliverableTitle( output: AgentStudioOutput ): string {
	const run = useAgentStudioRun( output.id );
	return resolveDeliverableTitle( output, run.data );
}
