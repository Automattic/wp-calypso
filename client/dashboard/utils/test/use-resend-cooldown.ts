/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { useResendCooldown } from '../use-resend-cooldown';

const MINUTE = 60 * 1000;

describe( 'useResendCooldown', () => {
	beforeEach( () => jest.useFakeTimers() );
	afterEach( () => jest.useRealTimers() );

	test( 'counts down to the deadline it was given', () => {
		const { result } = renderHook( () => useResendCooldown() );

		act( () => result.current.hold( 5 * 60 ) );
		expect( result.current.secondsUntilResend ).toBe( 5 * 60 );

		act( () => jest.advanceTimersByTime( 2 * MINUTE ) );
		expect( result.current.secondsUntilResend ).toBe( 3 * 60 );
	} );

	// The server is what actually refuses a resend, so the button must not reopen ahead of it: a
	// second answer can carry a smaller wait than the one already running.
	test( 'never shortens a wait already running', () => {
		const { result } = renderHook( () => useResendCooldown() );

		act( () => result.current.hold( 4 * 60 * 60 ) );
		act( () => result.current.hold( 5 * 60 ) );

		expect( result.current.secondsUntilResend ).toBe( 4 * 60 * 60 );
	} );

	test( 'reports each hold to the caller that persists it', () => {
		const onHold = jest.fn();
		const { result } = renderHook( () => useResendCooldown( { onHold } ) );

		act( () => result.current.hold( 5 * 60 ) );
		expect( onHold ).toHaveBeenCalledWith( expect.any( Number ) );
	} );

	test( 'clears a wait when explicitly reset', () => {
		const { result } = renderHook( () =>
			useResendCooldown( { initialDeadline: Date.now() + MINUTE } )
		);

		expect( result.current.secondsUntilResend ).toBe( 60 );
		act( () => result.current.reset() );
		expect( result.current.secondsUntilResend ).toBe( 0 );
	} );
} );
