/**
 * External dependencies
 */
// This is required to fix the "regeneratorRuntime is not defined" error
import '@automattic/calypso-polyfills';

/**
 * Internal dependencies
 */
import * as Timing from '../timing';

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
		await expect( Timing.timeoutPromise( new Promise( ( res ) => res( 123 ) ), 1 ) ).resolves.toBe(
			123
		);
		await expect( Timing.timeoutPromise( delayedValue( 123, 1 ), 2 ) ).resolves.toBe( 123 );
	} );
	it( 'should throw if promise gets timed-out', async () => {
		await expect( Timing.timeoutPromise( delayedValue( null, 2 ), 1 ) ).rejects.toThrowError();
		await expect( Timing.timeoutPromise( delayedValue( null, 3 ), 2 ) ).rejects.toThrowError();
	} );
} );

describe( 'asyncOneAtATime', () => {
	it( 'it should wrap an async function and behave the same', async () => {
		const f = Timing.asyncOneAtATime( async () => delayedValue( 123, 0 ) );
		await expect( f() ).resolves.toBe( 123 );
	} );

	it( 'it should return the same promise when called multiple times', async () => {
		const f = Timing.asyncOneAtATime( async () => delayedValue( 123, 1 ) );
		const a = f();
		const b = f();
		const c = f();
		expect( a ).toBe( b );
		expect( b ).toBe( c );
		await expect( a ).resolves.toBe( 123 );
	} );

	it( 'it should return a different promise after the last has resolved', async () => {
		const f = Timing.asyncOneAtATime( async () => delayedValue( 123, 5 ) );
		const a = f();
		const b = f();
		expect( a ).toBe( b );
		await expect( a ).resolves.toBe( 123 );

		await delayedValue( null, 5 );
		const c = f();
		const d = f();
		expect( a ).not.toBe( c );
		expect( c ).toBe( d );
		await expect( c ).resolves.toBe( 123 );
	} );
} );
