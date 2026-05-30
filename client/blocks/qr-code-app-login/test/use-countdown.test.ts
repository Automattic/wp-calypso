/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { useCountdown } from '../use-countdown';

describe( 'useCountdown', () => {
	let perfNow = 0;
	let dateNow = 1_000_000_000_000; // arbitrary epoch ms

	beforeEach( () => {
		perfNow = 0;
		dateNow = 1_000_000_000_000;
		jest.useFakeTimers();
		jest.spyOn( performance, 'now' ).mockImplementation( () => perfNow );
		jest.spyOn( Date, 'now' ).mockImplementation( () => dateNow );
	} );

	afterEach( () => {
		jest.useRealTimers();
		jest.restoreAllMocks();
	} );

	const advance = ( ms: number ) => {
		perfNow += ms;
		dateNow += ms;
		act( () => {
			jest.advanceTimersByTime( ms );
		} );
	};

	it( 'returns null when no expiry is provided', () => {
		const { result } = renderHook( () => useCountdown( undefined ) );
		expect( result.current ).toBeNull();
	} );

	it( 'starts the bar full and not expired', () => {
		const expires = ( dateNow + 60_000 ) / 1000;
		const { result } = renderHook( () => useCountdown( expires ) );

		expect( result.current ).toEqual( {
			remainingMs: 60_000,
			totalMs: 60_000,
			hasExpired: false,
		} );
	} );

	it( 'counts remaining time down as the perf-clock advances', () => {
		const expires = ( dateNow + 60_000 ) / 1000;
		const { result } = renderHook( () => useCountdown( expires ) );

		advance( 15_000 );

		expect( result.current?.totalMs ).toBe( 60_000 );
		expect( result.current?.remainingMs ).toBe( 45_000 );
		expect( result.current?.hasExpired ).toBe( false );
	} );

	it( 'flips to expired once the total elapses', () => {
		const expires = ( dateNow + 30_000 ) / 1000;
		const { result } = renderHook( () => useCountdown( expires ) );

		advance( 30_000 );

		expect( result.current?.remainingMs ).toBe( 0 );
		expect( result.current?.hasExpired ).toBe( true );
	} );

	it( 're-baselines when the expiry changes (e.g. a new token is issued)', () => {
		const firstExpires = ( dateNow + 30_000 ) / 1000;
		const { result, rerender } = renderHook(
			( { expires }: { expires: number } ) => useCountdown( expires ),
			{ initialProps: { expires: firstExpires } }
		);

		advance( 20_000 );
		expect( result.current?.remainingMs ).toBe( 10_000 );

		const secondExpires = ( dateNow + 60_000 ) / 1000;
		rerender( { expires: secondExpires } );

		expect( result.current ).toEqual( {
			remainingMs: 60_000,
			totalMs: 60_000,
			hasExpired: false,
		} );
	} );

	it( 'is immune to wall-clock jumps (uses the perf-clock for elapsed)', () => {
		const expires = ( dateNow + 60_000 ) / 1000;
		const { result } = renderHook( () => useCountdown( expires ) );

		// Wall clock jumps backwards 30s (NTP correction); perf-clock keeps going.
		dateNow -= 30_000;
		advance( 10_000 );

		// Elapsed is measured on the perf-clock (10s), not the wall clock.
		expect( result.current?.remainingMs ).toBe( 50_000 );
		expect( result.current?.hasExpired ).toBe( false );
	} );
} );
