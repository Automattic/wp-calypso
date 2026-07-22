/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { useDelayedCondition } from '../use-delayed-condition';

const DELAY = 2000;

const renderDelayed = ( condition: boolean ) =>
	renderHook( ( held: boolean ) => useDelayedCondition( held, DELAY ), {
		initialProps: condition,
	} );

const advance = ( ms: number ) =>
	act( () => {
		jest.advanceTimersByTime( ms );
	} );

describe( 'useDelayedCondition', () => {
	beforeEach( () => jest.useFakeTimers() );
	afterEach( () => jest.useRealTimers() );

	it( 'reports only once the condition has held for the whole delay', () => {
		const { result } = renderDelayed( true );
		expect( result.current ).toBe( false );

		advance( DELAY - 1 );
		expect( result.current ).toBe( false );

		advance( 1 );
		expect( result.current ).toBe( true );
	} );

	it( 'cancels the pending report when the condition clears first', () => {
		const { result, rerender } = renderDelayed( true );
		advance( DELAY - 1 );

		rerender( false );
		advance( DELAY );

		expect( result.current ).toBe( false );
	} );

	it( 'stops reporting when the condition recovers after the delay has passed', () => {
		const { result, rerender } = renderDelayed( true );
		advance( DELAY );
		expect( result.current ).toBe( true );

		rerender( false );

		expect( result.current ).toBe( false );
	} );

	it( 'gives a recurrence a fresh delay rather than reporting it at once', () => {
		const { result, rerender } = renderDelayed( true );
		advance( DELAY );
		rerender( false );

		rerender( true );
		expect( result.current ).toBe( false );

		advance( DELAY - 1 );
		expect( result.current ).toBe( false );

		advance( 1 );
		expect( result.current ).toBe( true );
	} );

	it( 'leaves no pending timer behind on unmount', () => {
		const { unmount } = renderDelayed( true );
		expect( jest.getTimerCount() ).toBe( 1 );

		unmount();

		expect( jest.getTimerCount() ).toBe( 0 );
	} );
} );
