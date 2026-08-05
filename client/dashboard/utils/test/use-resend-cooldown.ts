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

	// The server is what actually refuses a resend, so the button must not reopen ahead of it. A
	// tab can adopt a longer wait another tab recorded and only then get its own, shorter answer —
	// and it sees no storage event for its own write, so nothing would correct it afterwards.
	test( 'never shortens a wait, whichever way the shorter one arrives', () => {
		const { result } = renderHook( () => useResendCooldown() );

		act( () => result.current.adopt( Date.now() + 4 * 60 * MINUTE ) );
		act( () => result.current.hold( 5 * 60 ) );

		expect( result.current.secondsUntilResend ).toBe( 4 * 60 * 60 );
	} );

	test( 'reports each hold to the caller that persists it', () => {
		const onHold = jest.fn();
		const { result } = renderHook( () => useResendCooldown( { onHold } ) );

		act( () => result.current.hold( 5 * 60 ) );
		expect( onHold ).toHaveBeenCalledWith( expect.any( Number ) );

		// Adopting is the listening half: reporting it back would write it again, and the write is
		// what other tabs are listening for.
		onHold.mockClear();
		act( () => result.current.adopt( Date.now() + 10 * MINUTE ) );
		expect( onHold ).not.toHaveBeenCalled();
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
