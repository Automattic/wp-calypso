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
