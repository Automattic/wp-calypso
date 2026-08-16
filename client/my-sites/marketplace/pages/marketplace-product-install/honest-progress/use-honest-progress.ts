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
 */
export function useHonestProgress( {
	transferStatus,
	currentStep,
}: {
	transferStatus: string | null;
	currentStep: number;
} ) {
	const stage = getHonestStage( { transferStatus, currentStep } );

	const [ elapsed, setElapsed ] = useState( 0 );
	const [ stageElapsed, setStageElapsed ] = useState( 0 );
	const previousStageRef = useRef( stage );

	useEffect( () => {
		const id = setInterval( () => {
			setElapsed( ( seconds ) => seconds + TICK_MS / 1000 );
			setStageElapsed( ( seconds ) => seconds + TICK_MS / 1000 );
		}, TICK_MS );
		return () => clearInterval( id );
	}, [] );

	useEffect( () => {
		if ( previousStageRef.current !== stage ) {
			previousStageRef.current = stage;
			setStageElapsed( 0 );
		}
	}, [ stage ] );

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
