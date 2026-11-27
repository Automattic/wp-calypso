/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { THANK_YOU_WAIT_DEADLINE_MS, useThankYouDeadline } from '../use-thank-you-deadline';

const renderDeadline = () =>
	renderHook( () =>
		useThankYouDeadline( {
			siteId: 1,
			productKey: 'sensei-pro',
			enabled: true,
		} )
	);

describe( 'useThankYouDeadline', () => {
	beforeEach( () => {
		vi.useFakeTimers();
		vi.setSystemTime( 1000000 );
		window.sessionStorage.clear();
	} );

	afterEach( () => vi.useRealTimers() );

	it( 'bounds the whole page wait to five minutes', () => {
		const { result } = renderDeadline();

		act( () => vi.advanceTimersByTime( THANK_YOU_WAIT_DEADLINE_MS - 1000 ) );
		expect( result.current.hasTimedOut ).toBe( false );

		act( () => vi.advanceTimersByTime( 1000 ) );
		expect( result.current.hasTimedOut ).toBe( true );
	} );

	it( 'keeps the original deadline across a remount', () => {
		const first = renderDeadline();
		act( () => vi.advanceTimersByTime( THANK_YOU_WAIT_DEADLINE_MS - 1000 ) );
		first.unmount();

		act( () => vi.advanceTimersByTime( 1000 ) );
		const second = renderDeadline();

		expect( second.result.current.hasTimedOut ).toBe( true );
	} );

	it( 'starts a fresh budget on explicit retry', () => {
		const { result } = renderDeadline();
		act( () => vi.advanceTimersByTime( THANK_YOU_WAIT_DEADLINE_MS ) );
		expect( result.current.hasTimedOut ).toBe( true );

		act( () => result.current.restart() );

		expect( result.current.hasTimedOut ).toBe( false );
	} );

	it( 'clears the durable deadline after success', () => {
		const first = renderDeadline();
		act( () => vi.advanceTimersByTime( THANK_YOU_WAIT_DEADLINE_MS ) );
		act( () => first.result.current.complete() );
		first.unmount();

		const second = renderDeadline();

		expect( second.result.current.hasTimedOut ).toBe( false );
	} );
} );
