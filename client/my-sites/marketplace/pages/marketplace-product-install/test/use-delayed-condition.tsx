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
		advance( DELAY - 1 );
		expect( result.current ).toBe( false );
		advance( 1 );
		expect( result.current ).toBe( true );
	} );

	it( 'cancels the pending report if the condition clears first', () => {
		const { result, rerender } = renderDelayed( true );
		advance( DELAY - 1 );
		rerender( false );
		advance( DELAY );
		expect( result.current ).toBe( false );
	} );

	it( 'stops reporting when the condition clears after the delay', () => {
		const { result, rerender } = renderDelayed( true );
		advance( DELAY );
		rerender( false );
		expect( result.current ).toBe( false );
	} );

	it( 'makes a recurrence wait out a fresh delay', () => {
		const { result, rerender } = renderDelayed( true );
		advance( DELAY );
		rerender( false );
		rerender( true );
		expect( result.current ).toBe( false );
		advance( DELAY );
		expect( result.current ).toBe( true );
	} );

	it( 'leaves no pending timer behind on unmount', () => {
		const { unmount } = renderDelayed( true );
		unmount();
		expect( jest.getTimerCount() ).toBe( 0 );
	} );
} );
