import { useCallback, useEffect, useRef, useState } from 'react';
import { transferStates } from 'calypso/state/automated-transfer/constants';

export type DemoScenario = 'typical' | 'slow' | 'failure';

type Beat = { status: string; seconds: number };

// Median production timings, in the vocabulary of the latest-transfer endpoint the real page polls
// (`completed`, not `complete`); the slow scenario stretches provisioning, the failure one dies
// mid-move. The install/activate tail after the transfer is what the last beat stands for.
const TIMELINES: Record< DemoScenario, Beat[] > = {
	typical: [
		{ status: transferStates.PENDING, seconds: 3 },
		{ status: transferStates.ACTIVE, seconds: 22 },
		{ status: transferStates.PROVISIONED, seconds: 3 },
		{ status: transferStates.RELOCATING, seconds: 6 },
		{ status: transferStates.COMPLETE, seconds: 7 },
	],
	slow: [
		{ status: transferStates.PENDING, seconds: 3 },
		{ status: transferStates.ACTIVE, seconds: 70 },
		{ status: transferStates.PROVISIONED, seconds: 3 },
		{ status: transferStates.RELOCATING, seconds: 8 },
		{ status: transferStates.COMPLETE, seconds: 9 },
	],
	failure: [
		{ status: transferStates.PENDING, seconds: 3 },
		{ status: transferStates.ACTIVE, seconds: 22 },
		{ status: transferStates.PROVISIONED, seconds: 3 },
		{ status: transferStates.RELOCATING, seconds: 4 },
		{ status: transferStates.ERROR, seconds: 0 },
	],
};

const TICK_MS = 250;

export type FakeTransfer = {
	transferStatus: string | null;
	currentStep: number;
	elapsed: number;
	isDone: boolean;
	isFailed: boolean;
	// Increments on every replay; key the wait UI on it so its own clock restarts too.
	run: number;
	replay: () => void;
};

/**
 * Walks a fake transfer through the statuses the real endpoint reports, on the real timings
 * (divided by `speed`), so the wait UIs can be watched and replayed without a site.
 */
export function useFakeTransfer( {
	scenario,
	speed,
}: {
	scenario: DemoScenario;
	speed: number;
} ): FakeTransfer {
	const [ elapsed, setElapsed ] = useState( 0 );
	const [ run, setRun ] = useState( 0 );
	const timeline = TIMELINES[ scenario ];
	const speedRef = useRef( speed );
	speedRef.current = speed;

	useEffect( () => {
		setElapsed( 0 );
		const id = setInterval( () => {
			setElapsed( ( seconds ) => seconds + ( TICK_MS / 1000 ) * speedRef.current );
		}, TICK_MS );
		return () => clearInterval( id );
	}, [ scenario, run ] );

	let cursor = 0;
	let transferStatus: string | null = null;
	for ( const beat of timeline ) {
		transferStatus = beat.status;
		cursor += beat.seconds;
		if ( elapsed < cursor ) {
			break;
		}
	}
	const total = timeline.reduce( ( sum, beat ) => sum + beat.seconds, 0 );
	const isFailed = transferStatus === transferStates.ERROR;
	const isDone = ! isFailed && elapsed >= total;
	// The real page moves to its activation step once the transfer completes; mirror that so the
	// "finishing up" stage lights the same way it does in production.
	const currentStep = isDone || transferStatus === transferStates.COMPLETE ? 2 : 1;

	const replay = useCallback( () => setRun( ( n ) => n + 1 ), [] );

	return { transferStatus, currentStep, elapsed, isDone, isFailed, run, replay };
}
