/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import { useFakeTransfer } from '../use-fake-transfer';

describe( 'useFakeTransfer', () => {
	beforeEach( () => jest.useFakeTimers() );
	afterEach( () => jest.useRealTimers() );

	it( 'walks the typical timeline to completion and reports the activation step', () => {
		const { result } = renderHook( () => useFakeTransfer( { scenario: 'typical', speed: 1 } ) );
		expect( result.current.transferStatus ).toBe( transferStates.PENDING );

		act( () => jest.advanceTimersByTime( 10_000 ) );
		expect( result.current.transferStatus ).toBe( transferStates.ACTIVE );
		expect( result.current.currentStep ).toBe( 1 );

		act( () => jest.advanceTimersByTime( 30_000 ) );
		expect( result.current.transferStatus ).toBe( transferStates.COMPLETED );
		expect( result.current.currentStep ).toBe( 2 );
		expect( result.current.isDone ).toBe( false );

		act( () => jest.advanceTimersByTime( 10_000 ) );
		expect( result.current.isDone ).toBe( true );
	} );

	it( 'ends the failure scenario in an error and never reports done', () => {
		const { result } = renderHook( () => useFakeTransfer( { scenario: 'failure', speed: 4 } ) );
		act( () => jest.advanceTimersByTime( 20_000 ) );
		expect( result.current.isFailed ).toBe( true );
		expect( result.current.isDone ).toBe( false );
	} );

	it( 'replay starts over from the first status', () => {
		const { result } = renderHook( () => useFakeTransfer( { scenario: 'typical', speed: 4 } ) );
		act( () => jest.advanceTimersByTime( 20_000 ) );
		expect( result.current.isDone ).toBe( true );
		act( () => result.current.replay() );
		expect( result.current.transferStatus ).toBe( transferStates.PENDING );
		expect( result.current.isDone ).toBe( false );
	} );
} );
