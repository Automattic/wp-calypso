/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { useBackoffPoll } from '../use-backoff-poll';

const setVisibility = ( state: 'visible' | 'hidden' ) => {
	Object.defineProperty( document, 'visibilityState', { value: state, configurable: true } );
	act( () => {
		document.dispatchEvent( new Event( 'visibilitychange' ) );
	} );
};

describe( 'useBackoffPoll', () => {
	beforeEach( () => vi.useFakeTimers() );
	afterEach( () => {
		vi.useRealTimers();
		setVisibility( 'visible' );
	} );

	it( 'pauses while the tab is hidden', () => {
		const poll = vi.fn();
		renderHook( () => useBackoffPoll( poll, true ) );

		setVisibility( 'hidden' );
		poll.mockClear();
		act( () => vi.advanceTimersByTime( 60 * 1000 ) );
		expect( poll ).not.toHaveBeenCalled();
	} );

	// Nothing listens while disabled, so a tab hidden at mount and revealed before being enabled
	// would otherwise still be recorded as hidden, and never poll at all.
	it( 'picks up visibility that changed while it was disabled', () => {
		const poll = vi.fn();
		setVisibility( 'hidden' );
		const { rerender } = renderHook(
			( { enabled }: { enabled: boolean } ) => useBackoffPoll( poll, enabled ),
			{ initialProps: { enabled: false } }
		);

		Object.defineProperty( document, 'visibilityState', { value: 'visible', configurable: true } );
		rerender( { enabled: true } );

		act( () => vi.advanceTimersByTime( 30 * 1000 ) );
		expect( poll ).toHaveBeenCalled();
	} );

	// Otherwise the wait counts from mount — through the whole signup form — and the first poll
	// lands on the slowest rung.
	it( 'starts its ladder from when it was enabled, not from when it mounted', () => {
		const poll = vi.fn();
		const { rerender } = renderHook(
			( { enabled }: { enabled: boolean } ) => useBackoffPoll( poll, enabled ),
			{ initialProps: { enabled: false } }
		);

		act( () => vi.advanceTimersByTime( 40 * 60 * 1000 ) );
		rerender( { enabled: true } );

		// A tick at a time, so each rung change takes effect before the next one — advancing a
		// minute in one go would keep the opening interval either way and prove nothing.
		poll.mockClear();
		for ( let i = 0; i < 6; i++ ) {
			act( () => vi.advanceTimersByTime( 10 * 1000 ) );
		}
		expect( poll ).toHaveBeenCalledTimes( 6 );
	} );
} );
