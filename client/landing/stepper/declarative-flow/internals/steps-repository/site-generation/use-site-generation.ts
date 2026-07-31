import { useEffect, useState } from 'react';
import { logBuildWowEvent } from 'calypso/landing/stepper/utils/build-wow';
import { getStepIndexForProgress, pollForBuildProgress } from './build-progress-poller';
import { pollForBuildWowStatus } from './build-status-poller';

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

function getStepsWithProgress(
	steps: Array< Pick< SiteGenerationStep, 'id' | 'label' > >,
	activeStepIndex: number
): SiteGenerationStep[] {
	return steps.map( ( step, index ) => {
		let status: SiteGenerationStep[ 'status' ] = 'pending';
		if ( index < activeStepIndex ) {
			status = 'complete';
		} else if ( index === activeStepIndex ) {
			status = 'active';
		}
		return { ...step, status };
	} );
}

export function useSiteGeneration( {
	siteIdentifier,
	editorUrl,
	steps,
}: {
	siteIdentifier: string | null;
	editorUrl: string | null;
	steps: Array< Pick< SiteGenerationStep, 'id' | 'label' > >;
} ): SiteGenerationState {
	const [ activeStepIndex, setActiveStepIndex ] = useState( 0 );
	const [ hasTimedOut, setHasTimedOut ] = useState( false );
	const hasRequiredParameters = Boolean( siteIdentifier && editorUrl );

	useEffect( () => {
		if ( ! siteIdentifier || ! editorUrl || hasTimedOut ) {
			return;
		}

		const stepIds = steps.map( ( step ) => step.id );

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
			onRequestError: ( reason ) =>
				logBuildWowEvent( 'site_generation_status_request_failed', {
					site_identifier: siteIdentifier,
					error: reason,
				} ),
		} );
		// `let` so onProgress below can stop its own poller; the callback only
		// ever fires after pollForBuildProgress has returned.
		let stopProgressPolling = () => {};
		stopProgressPolling = pollForBuildProgress( {
			siteIdentifier,
			onProgress: ( response ) => {
				const stepIndex = getStepIndexForProgress( response, stepIds );
				if ( stepIndex === null ) {
					return;
				}
				// Monotonic floor: the backend can reset or reorder the recorded
				// history (heartbeats, requeues), and the UI must never move back.
				setActiveStepIndex( ( previous ) => Math.max( previous, stepIndex ) );
				// The last milestone is as far as this poller can advance the UI;
				// from here readiness comes from the build-status poller alone.
				if ( stepIndex >= stepIds.length - 1 ) {
					stopProgressPolling();
				}
			},
		} );

		return () => {
			window.clearTimeout( generationTimeout );
			stopStatusPolling();
			stopProgressPolling();
		};
	}, [ editorUrl, hasTimedOut, siteIdentifier, steps ] );

	let failureReason: SiteGenerationFailureReason | undefined;
	if ( ! hasRequiredParameters ) {
		failureReason = 'missing-parameters';
	} else if ( hasTimedOut ) {
		failureReason = 'timed-out';
	}

	return {
		status: failureReason ? 'failed' : 'working',
		failureReason,
		steps: getStepsWithProgress( steps, Math.min( steps.length - 1, activeStepIndex ) ),
	};
}
