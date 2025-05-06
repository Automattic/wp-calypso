import { delayedValue } from '../test-common';
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

describe( 'timeoutPromise', () => {
	it( 'should resolve promises below the timeout', async () => {
		const promise1 = Timing.timeoutPromise( Promise.resolve( 123 ), 1 );
		jest.advanceTimersByTime( 2 );
		await expect( promise1 ).resolves.toBe( 123 );
		const promise2 = Timing.timeoutPromise( delayedValue( 123, 1 ), 4 );
		jest.advanceTimersByTime( 5 );
		await expect( promise2 ).resolves.toBe( 123 );
	} );
	it( 'should reject if promises rejected below the timeout', async () => {
		const promise = Timing.timeoutPromise( Promise.reject( new Error( 'error-123' ) ), 1 );
		jest.advanceTimersByTime( 1 );
		await expect( promise ).rejects.toThrow( 'error-123' );
	} );
	it( 'should throw if promise gets timed-out', async () => {
		const promise1 = Timing.timeoutPromise( delayedValue( null, 4 ), 1 );
		jest.advanceTimersByTime( 5 );
		await expect( promise1 ).rejects.toThrow();
		const promise2 = Timing.timeoutPromise( delayedValue( null, 5 ), 2 );
		jest.advanceTimersByTime( 6 );
		await expect( promise2 ).rejects.toThrow();
	} );
} );

describe( 'asyncOneAtATime', () => {
	it( 'should wrap an async function and behave the same', async () => {
		const f = Timing.asyncOneAtATime( async () => delayedValue( 123, 0 ) );
		const promise = f();
		jest.advanceTimersByTime( 1 );
		await expect( promise ).resolves.toBe( 123 );
	} );

	it( 'should wrap an async function and behave the same (rejection)', async () => {
		const f = Timing.asyncOneAtATime( async () => {
			throw new Error( 'error-123' );
		} );
		await expect( f() ).rejects.toThrow( 'error-123' );
	} );

	it( 'should return the same promise when called multiple times, only calling the original function once', async () => {
		const origF = jest.fn( async () => delayedValue( 123, 1 ) );
		const f = Timing.asyncOneAtATime( origF );
		const a = f();
		const b = f();
		const c = f();
		expect( a ).toBe( b );
		expect( b ).toBe( c );
		jest.advanceTimersByTime( 2 );
		await expect( a ).resolves.toBe( 123 );
		expect( origF.mock.calls.length ).toBe( 1 );
	} );

	it( 'should return the same promise when called multiple times (rejection), only calling the original function once', async () => {
		const origF = jest.fn( async () => {
			throw new Error( 'error-123' );
		} );
		const f = Timing.asyncOneAtATime( origF );
		const a = f();
		const b = f();
		const c = f();
		expect( a ).toBe( b );
		expect( b ).toBe( c );
		await expect( a ).rejects.toThrow( 'error-123' );
		expect( origF.mock.calls.length ).toBe( 1 );
	} );

	it( 'should return a different promise after the last has resolved, calling the orignal function twice', async () => {
		const origF = jest.fn( async () => delayedValue( 123, 3 ) );
		const f = Timing.asyncOneAtATime( origF );
		const a = f();
		const b = f();
		expect( a ).toBe( b );
		jest.advanceTimersByTime( 4 );
		await expect( a ).resolves.toBe( 123 );
		expect( origF.mock.calls.length ).toBe( 1 );

		jest.advanceTimersByTime( 4 );
		const c = f();
		const d = f();
		expect( a ).not.toBe( c );
		expect( c ).toBe( d );
		jest.advanceTimersByTime( 4 );
		await expect( c ).resolves.toBe( 123 );
		expect( origF.mock.calls.length ).toBe( 2 );
	} );

	it( 'should return a different promise after the last has resolved (rejection), calling the original function twice', async () => {
		let isReject = true;
		const origF = jest.fn( async () => {
			if ( isReject ) {
				throw new Error( 'error-123' );
			}
			return 123;
		} );
		const f = Timing.asyncOneAtATime( origF );
		const a = f();
		const b = f();
		expect( a ).toBe( b );
		await expect( a ).rejects.toThrow( 'error-123' );
		expect( origF.mock.calls.length ).toBe( 1 );

		isReject = false;
		const c = f();
		const d = f();
		expect( a ).not.toBe( c );
		expect( c ).toBe( d );
		await expect( c ).resolves.toBe( 123 );
		expect( origF.mock.calls.length ).toBe( 2 );
	} );
} );
