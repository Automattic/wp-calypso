import { useEffect, useState } from 'react';
import { logBuildWowEvent } from 'calypso/landing/stepper/utils/build-wow';
import { pollForBuildWowStatus } from './build-status-poller';
import type { BuildWowUi } from './build-status-poller';

export type SiteGenerationStep = {
	id: string;
	label: string;
	status: 'pending' | 'active' | 'complete';
};

export type SiteGenerationFailureReason = 'missing-parameters' | 'timed-out';

export type SiteGenerationState = {
	status: 'working' | 'failed';
	failureReason?: SiteGenerationFailureReason;
	steps: SiteGenerationStep[];
};

const GENERATION_TIMEOUT_MS = 30 * 60 * 1000;

// The server computes the checklist (ui.steps) from the build's durable
// signals and localizes the labels; this maps its rows onto the view's step
// shape. Rows without an id or label are dropped rather than rendered empty.
function getStepsFromServer( ui: BuildWowUi ): SiteGenerationStep[] {
	return ( ui.steps ?? [] )
		.filter( ( step ) => step.id && step.label )
		.map( ( step ) => ( {
			id: step.id as string,
			label: step.label as string,
			status:
				step.state === 'done' ? 'complete' : step.state === 'active' ? 'active' : 'pending',
		} ) );
}

export function useSiteGeneration( {
	siteIdentifier,
	editorUrl,
	steps,
}: {
	siteIdentifier: string | null;
	editorUrl: string | null;
	// Fallback checklist, shown until the first status response delivers the
	// server-computed ui.steps (and kept for backends without the ui block).
	steps: Array< Pick< SiteGenerationStep, 'id' | 'label' > >;
} ): SiteGenerationState {
	const [ serverSteps, setServerSteps ] = useState< SiteGenerationStep[] | null >( null );
	const [ hasTimedOut, setHasTimedOut ] = useState( false );
	const hasRequiredParameters = Boolean( siteIdentifier && editorUrl );

	useEffect( () => {
		if ( ! siteIdentifier || ! editorUrl || hasTimedOut ) {
			return;
		}

		const generationTimeout = window.setTimeout(
			() => setHasTimedOut( true ),
			GENERATION_TIMEOUT_MS
		);
		const stopStatusPolling = pollForBuildWowStatus( {
			siteIdentifier,
			onReady: () => window.location.assign( editorUrl ),
			// A failed build is logged for us but never surfaced as an error: the
			// user only ever sees the calm "your brief is saved, check again" state
			// instead of a dead end.
			onFailed: ( status ) => {
				logBuildWowEvent( 'site_generation_failed', {
					status,
					site_identifier: siteIdentifier,
				} );
				setHasTimedOut( true );
			},
			// The sidebar renders the server's checklist verbatim: the same poll
			// that decides readiness also carries the steps, so the two can never
			// contradict each other.
			onUpdate: ( ui ) => {
				const nextSteps = getStepsFromServer( ui );
				if ( nextSteps.length > 0 ) {
					setServerSteps( nextSteps );
				}
			},
			onRequestError: ( reason ) =>
				logBuildWowEvent( 'site_generation_status_request_failed', {
					site_identifier: siteIdentifier,
					error: reason,
				} ),
		} );

		return () => {
			window.clearTimeout( generationTimeout );
			stopStatusPolling();
		};
	}, [ editorUrl, hasTimedOut, siteIdentifier ] );

	let failureReason: SiteGenerationFailureReason | undefined;
	if ( ! hasRequiredParameters ) {
		failureReason = 'missing-parameters';
	} else if ( hasTimedOut ) {
		failureReason = 'timed-out';
	}

	return {
		status: failureReason ? 'failed' : 'working',
		failureReason,
		steps:
			serverSteps ??
			steps.map( ( step, index ) => ( {
				...step,
				status: index === 0 ? ( 'active' as const ) : ( 'pending' as const ),
			} ) ),
	};
}
