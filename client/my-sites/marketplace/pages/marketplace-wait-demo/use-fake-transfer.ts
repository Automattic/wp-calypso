import { useCallback, useEffect, useState } from 'react';
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
		{ status: transferStates.COMPLETED, seconds: 7 },
	],
	slow: [
		{ status: transferStates.PENDING, seconds: 3 },
		{ status: transferStates.ACTIVE, seconds: 70 },
		{ status: transferStates.PROVISIONED, seconds: 3 },
		{ status: transferStates.RELOCATING, seconds: 8 },
		{ status: transferStates.COMPLETED, seconds: 9 },
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
 * (multiplied by `speed`), so the wait UIs can be watched and replayed without a site.
 *
 * Wall-clock based, like the UIs it drives: the interval only re-renders, so a throttled
 * background tab slows the redraw, not the transfer. Changing scenario or speed starts over.
 */
export function useFakeTransfer( {
	scenario,
	speed,
}: {
	scenario: DemoScenario;
	speed: number;
} ): FakeTransfer {
	const [ run, setRun ] = useState( 0 );
	const [ startedAt, setStartedAt ] = useState( () => Date.now() );
	const [ now, setNow ] = useState( startedAt );
	const timeline = TIMELINES[ scenario ];

	useEffect( () => {
		const began = Date.now();
		setStartedAt( began );
		setNow( began );
		const id = setInterval( () => setNow( Date.now() ), TICK_MS );
		return () => clearInterval( id );
	}, [ scenario, speed, run ] );

	const elapsed = ( ( now - startedAt ) / 1000 ) * speed;

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
	const currentStep = isDone || transferStatus === transferStates.COMPLETED ? 2 : 1;

	const replay = useCallback( () => setRun( ( n ) => n + 1 ), [] );

	return { transferStatus, currentStep, elapsed, isDone, isFailed, run, replay };
}
