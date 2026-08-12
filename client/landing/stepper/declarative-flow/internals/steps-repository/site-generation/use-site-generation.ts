import { useEffect, useState } from 'react';
import { logBuildWowEvent } from 'calypso/landing/stepper/utils/build-wow';
import { getStepProgress, pollForBuildProgress } from './build-progress-poller';
import { pollForBuildWowStatus } from './build-status-poller';

export type SiteGenerationStep = {
	id: string;
	label: string;
	status: 'idle' | 'active' | 'done';
	startedAt?: number;
};

export type SiteGenerationFailureReason = 'build-failed' | 'missing-parameters' | 'timed-out';

export type SiteGenerationState = {
	status: 'working' | 'failed';
	failureReason?: SiteGenerationFailureReason;
	steps: SiteGenerationStep[];
};

const GENERATION_TIMEOUT_MS = 30 * 60 * 1000;

// Step start times come from the server, but the elapsed clock ticks on
// Date.now(). A skewed client clock would freeze the counter at zero or inflate
// it, so an implausible server value falls back to local time.
function getPlausibleStart( startedAt: number | undefined ): number {
	const now = Date.now();
	if ( startedAt === undefined || startedAt > now || now - startedAt > GENERATION_TIMEOUT_MS ) {
		return now;
	}
	return startedAt;
}

function getStepsWithProgress(
	steps: Array< Pick< SiteGenerationStep, 'id' | 'label' > >,
	activeStepIndex: number,
	activeStepStartedAt: number
): SiteGenerationStep[] {
	return steps.map( ( step, index ) => {
		let status: SiteGenerationStep[ 'status' ] = 'idle';
		if ( index < activeStepIndex ) {
			status = 'done';
		} else if ( index === activeStepIndex ) {
			status = 'active';
		}
		return {
			...step,
			status,
			startedAt: status === 'active' ? activeStepStartedAt : undefined,
		};
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
	const [ activeProgress, setActiveProgress ] = useState( () => ( {
		stepIndex: 0,
		startedAt: Date.now(),
	} ) );
	const [ runtimeFailureReason, setRuntimeFailureReason ] = useState<
		Exclude< SiteGenerationFailureReason, 'missing-parameters' > | undefined
	>();
	const hasRequiredParameters = Boolean( siteIdentifier && editorUrl );

	useEffect( () => {
		if ( ! siteIdentifier || ! editorUrl || runtimeFailureReason ) {
			return;
		}

		const stepIds = steps.map( ( step ) => step.id );

		const generationTimeout = window.setTimeout(
			() => setRuntimeFailureReason( 'timed-out' ),
			GENERATION_TIMEOUT_MS
		);
		const handleBuildFailure = ( status: string ) => {
			logBuildWowEvent( 'site_generation_failed', {
				status,
				site_identifier: siteIdentifier,
			} );
			setRuntimeFailureReason( 'build-failed' );
		};
		const stopStatusPolling = pollForBuildWowStatus( {
			siteIdentifier,
			onReady: () => window.location.assign( editorUrl ),
			onFailed: handleBuildFailure,
			onRequestError: ( reason ) =>
				logBuildWowEvent( 'site_generation_status_request_failed', {
					site_identifier: siteIdentifier,
					error: reason,
				} ),
		} );
		const stopProgressPolling = pollForBuildProgress( {
			siteIdentifier,
			onProgress: ( response ) => {
				if ( response.current === 'fail' ) {
					handleBuildFailure( response.current );
					return;
				}
				const progress = getStepProgress( response, stepIds );
				if ( progress === null ) {
					return;
				}
				// Monotonic floor: the backend can reset or reorder the recorded
				// history (heartbeats, requeues), and the UI must never move back.
				setActiveProgress( ( previous ) => {
					if ( progress.stepIndex < previous.stepIndex ) {
						return previous;
					}
					if ( progress.stepIndex === previous.stepIndex ) {
						return {
							...previous,
							startedAt: Math.min( previous.startedAt, getPlausibleStart( progress.startedAt ) ),
						};
					}
					return {
						stepIndex: progress.stepIndex,
						startedAt: getPlausibleStart( progress.startedAt ),
					};
				} );
			},
		} );

		return () => {
			window.clearTimeout( generationTimeout );
			stopStatusPolling();
			stopProgressPolling();
		};
	}, [ editorUrl, runtimeFailureReason, siteIdentifier, steps ] );

	const failureReason: SiteGenerationFailureReason | undefined = ! hasRequiredParameters
		? 'missing-parameters'
		: runtimeFailureReason;

	return {
		status: failureReason ? 'failed' : 'working',
		failureReason,
		steps: getStepsWithProgress(
			steps,
			Math.min( steps.length - 1, activeProgress.stepIndex ),
			activeProgress.startedAt
		),
	};
}
