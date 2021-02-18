/**
 * External dependencies
 */
// This is required to fix the "regeneratorRuntime is not defined" error
import '@automattic/calypso-polyfills';

/**
 * Internal dependencies
 */
import * as Timing from '../timing';

jest.useFakeTimers();

describe( 'monotonicNow', () => {
	it( 'should be strictly monotonic', () => {
		const spiedGetTime = jest.spyOn( global.Date, 'now' );
		const lastNow = Timing.monotonicNow();
		spiedGetTime.mockImplementationOnce( () => lastNow );
		expect( Timing.monotonicNow() ).toBe( lastNow + 1 );
		spiedGetTime.mockImplementationOnce( () => lastNow );
		expect( Timing.monotonicNow() ).toBe( lastNow + 2 );
	} );
} );

const delayedValue = < T >( value, delayMilliseconds ): Promise< T > =>
	new Promise( ( res ) => setTimeout( () => res( value ), delayMilliseconds ) );

describe( 'timeoutPromise', () => {
	it( 'should resolve promises below the timeout', async () => {
		const promise1 = Timing.timeoutPromise( new Promise( ( res ) => res( 123 ) ), 1 );
		jest.advanceTimersByTime( 2 );
		await expect( promise1 ).resolves.toBe( 123 );
		const promise2 = Timing.timeoutPromise( delayedValue( 123, 1 ), 4 );
		jest.advanceTimersByTime( 5 );
		await expect( promise2 ).resolves.toBe( 123 );
	} );
	it( 'should throw if promise gets timed-out', async () => {
		const promise1 = Timing.timeoutPromise( delayedValue( null, 4 ), 1 );
		jest.advanceTimersByTime( 5 );
		await expect( promise1 ).rejects.toThrowError();
		const promise2 = Timing.timeoutPromise( delayedValue( null, 5 ), 2 );
		jest.advanceTimersByTime( 6 );
		await expect( promise2 ).rejects.toThrowError();
	} );
} );

describe( 'asyncOneAtATime', () => {
	it( 'it should wrap an async function and behave the same', async () => {
		const f = Timing.asyncOneAtATime( async () => delayedValue( 123, 0 ) );
		const promise = f();
		jest.advanceTimersByTime( 1 );
		await expect( promise ).resolves.toBe( 123 );
	} );

	it( 'it should return the same promise when called multiple times', async () => {
		const f = Timing.asyncOneAtATime( async () => delayedValue( 123, 1 ) );
		const a = f();
		const b = f();
		const c = f();
		expect( a ).toBe( b );
		expect( b ).toBe( c );
		jest.advanceTimersByTime( 2 );
		await expect( a ).resolves.toBe( 123 );
	} );

	it( 'it should return a different promise after the last has resolved', async () => {
		const f = Timing.asyncOneAtATime( async () => delayedValue( 123, 3 ) );
		const a = f();
		const b = f();
		expect( a ).toBe( b );
		jest.advanceTimersByTime( 4 );
		await expect( a ).resolves.toBe( 123 );

		jest.advanceTimersByTime( 4 );
		const c = f();
		const d = f();
		expect( a ).not.toBe( c );
		expect( c ).toBe( d );
		jest.advanceTimersByTime( 4 );
		await expect( c ).resolves.toBe( 123 );
	} );
} );
