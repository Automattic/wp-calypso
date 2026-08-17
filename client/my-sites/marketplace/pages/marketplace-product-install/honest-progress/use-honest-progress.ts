import { useEffect, useRef, useState } from 'react';
import { getHonestStage, HONEST_STAGES } from './get-honest-stage';

const TICK_MS = 500;

// A stage's bar approaches but never reaches full until the server confirms the stage —
// the visual must not outrun the transfer.
const MAX_UNCONFIRMED_PROGRESS = 92;

// How far past a stage's typical duration we wait before saying it's running long.
const OVERRUN_FACTOR = 1.6;

/**
 * The honest wait's shared clock: which real stage the transfer is in, how long the wait
 * and the current stage have been running, and a per-stage progress figure that never
 * claims more than the server confirmed. Both wait variants render from this.
 *
 * Time is wall-clock, anchored to when the transfer started when that is known (it survives
 * a refresh and background-tab timer throttling; the interval only re-renders), otherwise to
 * when this UI mounted.
 */
export function useHonestProgress( {
	transferStatus,
	currentStep,
	startedAt,
}: {
	transferStatus: string | null;
	currentStep: number;
	startedAt?: number | null;
} ) {
	const stage = getHonestStage( { transferStatus, currentStep } );

	const [ now, setNow ] = useState( () => Date.now() );
	const mountedAt = useRef( now );
	const stageStartedAt = useRef( now );
	const previousStageRef = useRef( stage );

	if ( previousStageRef.current !== stage ) {
		previousStageRef.current = stage;
		stageStartedAt.current = now;
	}

	useEffect( () => {
		const id = setInterval( () => setNow( Date.now() ), TICK_MS );
		return () => clearInterval( id );
	}, [] );

	const anchor = startedAt ?? mountedAt.current;
	const elapsed = Math.max( 0, ( now - anchor ) / 1000 );
	// The first stage began when the transfer did; later stages when they were first observed.
	const stageElapsed =
		stage === 0 ? elapsed : Math.max( 0, ( now - stageStartedAt.current ) / 1000 );

	const isOverrun = stageElapsed > HONEST_STAGES[ stage ].expectedSeconds * OVERRUN_FACTOR;

	const getStageProgress = ( index: number ): number => {
		if ( index < stage ) {
			return 100;
		}
		if ( index > stage ) {
			return 0;
		}
		return Math.min(
			( stageElapsed / HONEST_STAGES[ index ].expectedSeconds ) * 100,
			MAX_UNCONFIRMED_PROGRESS
		);
	};

	return { stage, elapsed, stageElapsed, isOverrun, getStageProgress };
}
