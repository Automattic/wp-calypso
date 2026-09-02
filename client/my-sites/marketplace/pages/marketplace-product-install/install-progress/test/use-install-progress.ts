/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import { useInstallProgress } from '../use-install-progress';

describe( 'useInstallProgress', () => {
	beforeEach( () => {
		jest.useFakeTimers();
		jest.setSystemTime( new Date( '2026-08-17T10:00:00Z' ) );
	} );
	afterEach( () => jest.useRealTimers() );

	const advance = ( ms: number ) => act( () => jest.advanceTimersByTime( ms ) );

	it( 'measures elapsed from the transfer start when known, not from mount', () => {
		const startedAt = Date.now() - 12_000;
		const { result } = renderHook( () =>
			useInstallProgress( { transferStatus: transferStates.ACTIVE, currentStep: 1, startedAt } )
		);
		expect( result.current.elapsed ).toBeCloseTo( 12, 0 );
		advance( 3_000 );
		expect( result.current.elapsed ).toBeCloseTo( 15, 0 );
	} );

	it( 'does not call a finishing stage stalled while it is merely slow', () => {
		const { result } = renderHook( () =>
			useInstallProgress( { transferStatus: transferStates.COMPLETE, currentStep: 1 } )
		);
		advance( 89_000 );
		expect( result.current.isOverrun ).toBe( true );
		expect( result.current.isStalled ).toBe( false );
	} );

	it( 'calls a finishing stage stalled once it runs past 90s', () => {
		const { result } = renderHook( () =>
			useInstallProgress( { transferStatus: transferStates.COMPLETE, currentStep: 1 } )
		);
		advance( 91_000 );
		expect( result.current.isStalled ).toBe( true );
	} );

	// Earlier stages have nowhere to send anyone: the transfer itself is still unfinished.
	it( 'never calls an earlier stage stalled, however long it runs', () => {
		const { result } = renderHook( () =>
			useInstallProgress( { transferStatus: transferStates.ACTIVE, currentStep: 1 } )
		);
		advance( 300_000 );
		expect( result.current.isStalled ).toBe( false );
	} );

	it( 'never claims more than 92% of a stage until the server confirms it', () => {
		const { result } = renderHook( () =>
			useInstallProgress( { transferStatus: transferStates.ACTIVE, currentStep: 1 } )
		);
		advance( 120_000 );
		expect( result.current.getStageProgress( 0 ) ).toBe( 92 );
		expect( result.current.getStageProgress( 1 ) ).toBe( 0 );
	} );

	it( 'confirms a stage as full once the status moves on, and restarts the stage clock', () => {
		let status: string = transferStates.ACTIVE;
		const { result, rerender } = renderHook( () =>
			useInstallProgress( { transferStatus: status, currentStep: 1 } )
		);
		advance( 20_000 );
		status = transferStates.PROVISIONED;
		rerender();
		expect( result.current.stage ).toBe( 1 );
		expect( result.current.getStageProgress( 0 ) ).toBe( 100 );
		expect( result.current.stageElapsed ).toBeCloseTo( 0, 0 );
	} );

	it( 'a refresh mid-transfer anchors the stage clock to the transfer, not the mount', () => {
		const startedAt = Date.now() - 60_000;
		let status: string | null = null;
		const { result, rerender } = renderHook( () =>
			useInstallProgress( { transferStatus: status, currentStep: 1, startedAt } )
		);
		status = transferStates.RELOCATING;
		rerender();
		// The moving stage is estimated to have begun 25s into the transfer — 35s ago — so the
		// overrun line shows without waiting out the whole typical duration again.
		expect( result.current.stageElapsed ).toBeCloseTo( 35, 0 );
		expect( result.current.isOverrun ).toBe( true );
	} );

	it( 'the estimated stage start never predates the stage on a fast transfer', () => {
		const startedAt = Date.now() - 5_000;
		let status: string | null = null;
		const { result, rerender } = renderHook( () =>
			useInstallProgress( { transferStatus: status, currentStep: 1, startedAt } )
		);
		status = transferStates.RELOCATING;
		rerender();
		expect( result.current.stageElapsed ).toBeCloseTo( 0, 0 );
		expect( result.current.isOverrun ).toBe( false );
	} );

	it( 'estimates the stage start when the transfer clock arrives with the stage', () => {
		const startedAt = Date.now() - 60_000;
		// A refresh mid-transfer: the coarse fallback reports `start` before the poll lands, so a
		// status is known while the transfer's own clock is not.
		let status: string = transferStates.START;
		let transferStartedAt: number | null = null;
		const { result, rerender } = renderHook( () =>
			useInstallProgress( {
				transferStatus: status,
				currentStep: 1,
				startedAt: transferStartedAt,
			} )
		);
		status = transferStates.RELOCATING;
		transferStartedAt = startedAt;
		rerender();
		// The moving stage is estimated to have begun 25s into the transfer — 35s ago — rather than
		// restarted, so the overrun line is not delayed by the late poll.
		expect( result.current.stageElapsed ).toBeCloseTo( 35, 0 );
		expect( result.current.isOverrun ).toBe( true );
	} );

	it( 'holds the furthest stage when the status stops being recognised', () => {
		let status: string | null = transferStates.RELOCATING;
		const { result, rerender } = renderHook( () =>
			useInstallProgress( { transferStatus: status, currentStep: 1 } )
		);
		expect( result.current.stage ).toBe( 1 );
		// The poll loses sight of our transfer and the fallback only knows `start`.
		status = transferStates.START;
		rerender();
		expect( result.current.stage ).toBe( 1 );
		expect( result.current.getStageProgress( 0 ) ).toBe( 100 );
		status = null;
		rerender();
		expect( result.current.stage ).toBe( 1 );
	} );

	it( 'falls back to this page’s own clock when the transfer start is unusable', () => {
		const { result } = renderHook( () =>
			useInstallProgress( {
				transferStatus: transferStates.ACTIVE,
				currentStep: 1,
				startedAt: null,
			} )
		);
		advance( 10_000 );
		expect( result.current.elapsed ).toBeCloseTo( 10, 0 );
		expect( Number.isNaN( result.current.overallProgress ) ).toBe( false );
	} );

	it( 'flags an overrun only well past the stage’s typical duration', () => {
		const { result } = renderHook( () =>
			useInstallProgress( { transferStatus: transferStates.ACTIVE, currentStep: 1 } )
		);
		advance( 30_000 );
		expect( result.current.isOverrun ).toBe( false );
		advance( 15_000 );
		expect( result.current.isOverrun ).toBe( true );
	} );
} );
