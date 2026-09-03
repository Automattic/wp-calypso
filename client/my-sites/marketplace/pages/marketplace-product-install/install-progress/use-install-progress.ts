import { useRef, useState } from 'react';
import { useInterval } from 'calypso/lib/interval';
import { getInstallStage, INSTALL_STAGES } from './get-install-stage';

const TICK_MS = 500;

// A stage's bar approaches but never reaches full until the server confirms the stage —
// the visual must not outrun the transfer.
const MAX_UNCONFIRMED_PROGRESS = 92;

// How far past a stage's typical duration we wait before saying it's running long.
const OVERRUN_FACTOR = 1.6;

// Once finishing has run this long the wait stops reassuring and offers a way out: 90s clears the
// p95 of a healthy finishing stage while still catching every install that never activates.
const STALLED_SECONDS = 90;

// The only stage with somewhere to send people — before it the transfer itself is unfinished.
const FINISHING_STAGE = INSTALL_STAGES.length - 1;

/**
 * When this UI first learns the transfer is already past `preparing` — a refresh mid-transfer —
 * the real stage boundary was never observed. Estimate it from the transfer's start plus the
 * typical duration of the stages before it, clamped to now: on a fresh transfer the estimate is
 * in the future and the clamp makes this "the stage just started", the live behavior.
 */
const estimateStageStartedAt = (
	stage: number,
	startedAt: number | null | undefined,
	now: number
): number => {
	if ( stage === 0 || startedAt == null ) {
		return now;
	}
	const priorExpectedMs = INSTALL_STAGES.slice( 0, stage ).reduce(
		( sum, s ) => sum + s.expectedSeconds * 1000,
		0
	);
	return Math.min( now, startedAt + priorExpectedMs );
};

/**
 * The wait's clock: which real stage the transfer is in, how long the wait and the current
 * stage have been running, and a per-stage progress figure that never claims more than the
 * server confirmed.
 *
 * Time is wall-clock, anchored to when the transfer started when that is known (it survives
 * a refresh and background-tab timer throttling; the interval only re-renders), otherwise to
 * when this UI mounted.
 */
export function useInstallProgress( {
	transferStatus,
	currentStep,
	startedAt,
}: {
	transferStatus: string | null;
	currentStep: number;
	startedAt?: number | null;
} ) {
	const reportedStage = getInstallStage( { transferStatus, currentStep } );

	const [ now, setNow ] = useState( () => Date.now() );
	const mountedAt = useRef( now );
	// A status this mapping doesn't know, or a poll that momentarily loses sight of our transfer,
	// both report stage 0. Holding the furthest stage reached stops the wait from rewinding — a bar
	// that shrinks and a sentence that returns to "preparing" would be claiming the transfer went
	// backwards, which it never does.
	const furthestStage = useRef( reportedStage );
	const stage = Math.max( reportedStage, furthestStage.current );
	furthestStage.current = stage;

	const stageStartedAt = useRef( estimateStageStartedAt( stage, startedAt, now ) );
	const previousStageRef = useRef( stage );
	const statusWasKnownRef = useRef( transferStatus != null );
	const clockWasKnownRef = useRef( startedAt != null );

	if ( previousStageRef.current !== stage ) {
		previousStageRef.current = stage;
		// A stage change is a live transition only when this UI was already watching the transfer's
		// own clock, in which case the stage starts now. A stage that arrives together with that
		// clock — a first poll landing after a refresh, or after the coarse fallback status — was
		// already running, so estimate when it began instead of restarting it.
		stageStartedAt.current =
			statusWasKnownRef.current && clockWasKnownRef.current
				? now
				: estimateStageStartedAt( stage, startedAt, now );
	}
	statusWasKnownRef.current = transferStatus != null;
	clockWasKnownRef.current = startedAt != null;

	useInterval( () => setNow( Date.now() ), TICK_MS );

	const anchor = startedAt ?? mountedAt.current;
	const elapsed = Math.max( 0, ( now - anchor ) / 1000 );
	// The first stage began when the transfer did; later stages when they were first observed.
	const stageElapsed =
		stage === 0 ? elapsed : Math.max( 0, ( now - stageStartedAt.current ) / 1000 );

	const isOverrun = stageElapsed > INSTALL_STAGES[ stage ].expectedSeconds * OVERRUN_FACTOR;
	const isStalled = stage === FINISHING_STAGE && stageElapsed > STALLED_SECONDS;

	const getStageProgress = ( index: number ): number => {
		if ( index < stage ) {
			return 100;
		}
		if ( index > stage ) {
			return 0;
		}
		return Math.min(
			( stageElapsed / INSTALL_STAGES[ index ].expectedSeconds ) * 100,
			MAX_UNCONFIRMED_PROGRESS
		);
	};

	// One number for the whole wait: each stage weighted by its typical duration, fed by the
	// same capped per-stage figure, so the overall bar cannot outrun the transfer either.
	const totalExpected = INSTALL_STAGES.reduce( ( sum, s ) => sum + s.expectedSeconds, 0 );
	const overallProgress =
		INSTALL_STAGES.reduce(
			( sum, s, index ) => sum + getStageProgress( index ) * s.expectedSeconds,
			0
		) / totalExpected;

	return { stage, elapsed, stageElapsed, isOverrun, isStalled, getStageProgress, overallProgress };
}
