import { useEffect, useState } from 'react';
import { logBuildWowEvent } from 'calypso/landing/stepper/utils/build-wow';
import { getStepIndexForStatus, pollForBuildWowStatus } from './build-status-poller';

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

const STEP_DELAYS = [ 20000, 50000, 90000, 140000 ];
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
	const [ statusStepIndex, setStatusStepIndex ] = useState( -1 );
	const [ hasTimedOut, setHasTimedOut ] = useState( false );
	const hasRequiredParameters = Boolean( siteIdentifier && editorUrl );
	const stepCount = steps.length;

	useEffect( () => {
		if ( ! siteIdentifier || ! editorUrl || hasTimedOut ) {
			return;
		}

		const progressTimeouts = STEP_DELAYS.map( ( delay, index ) =>
			window.setTimeout( () => setActiveStepIndex( index + 1 ), delay )
		);
		const generationTimeout = window.setTimeout(
			() => setHasTimedOut( true ),
			GENERATION_TIMEOUT_MS
		);
		const stopPolling = pollForBuildWowStatus( {
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
			onProgress: ( status ) =>
				setStatusStepIndex( ( previous ) =>
					Math.max( previous, getStepIndexForStatus( status, stepCount ) ?? -1 )
				),
			onRequestError: ( error ) =>
				logBuildWowEvent( 'site_generation_status_request_failed', {
					site_identifier: siteIdentifier,
					error: error instanceof Error ? error.message : String( error ),
				} ),
		} );

		return () => {
			progressTimeouts.forEach( window.clearTimeout );
			window.clearTimeout( generationTimeout );
			stopPolling();
		};
	}, [ editorUrl, siteIdentifier, hasTimedOut, stepCount ] );

	let failureReason: SiteGenerationFailureReason | undefined;
	if ( ! hasRequiredParameters ) {
		failureReason = 'missing-parameters';
	} else if ( hasTimedOut ) {
		failureReason = 'timed-out';
	}

	// Real delivery-phase statuses drive the progress ahead of the fixed timers,
	// never behind them, so the display only ever moves forward (keeping the
	// designed step labels as-is).
	const effectiveActiveIndex = Math.max( activeStepIndex, statusStepIndex );

	return {
		status: failureReason ? 'failed' : 'working',
		failureReason,
		steps: getStepsWithProgress( steps, effectiveActiveIndex ),
	};
}
