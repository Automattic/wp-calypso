import { describe, expect, test } from '@jest/globals';
import {
	pollUntilAvailable,
	formatAvailabilityProbe,
	type AvailabilityClock,
	type AvailabilityProbe,
} from '../element-helper';

/**
 * Deterministic clock: time only advances when `sleep()` is called, so the
 * polling loop can be tested without real timers.
 */
function fakeClock( startMs = 0 ): AvailabilityClock {
	let current = startMs;
	return {
		now: () => current,
		sleep: ( ms: number ) => {
			current += ms;
			return Promise.resolve();
		},
	};
}

describe( 'pollUntilAvailable', () => {
	test( 'reports recovery at 0ms when the first poll is already 200', async () => {
		const result = await pollUntilAvailable( () => Promise.resolve( 200 ), {
			capMs: 10000,
			intervalMs: 1000,
			clock: fakeClock(),
		} );
		expect( result ).toEqual( { recoveredAfterMs: 0, lastStatus: 200 } );
	} );

	test( 'measures elapsed time across multiple polls before recovery', async () => {
		const statuses = [ 404, 404, 404, 200 ];
		let i = 0;
		const result = await pollUntilAvailable( () => Promise.resolve( statuses[ i++ ] ), {
			capMs: 10000,
			intervalMs: 1000,
			clock: fakeClock(),
		} );
		// Three 1000ms sleeps happened before the fourth poll returned 200.
		expect( result ).toEqual( { recoveredAfterMs: 3000, lastStatus: 200 } );
	} );

	test( 'gives up at the cap and reports the last failing status', async () => {
		const result = await pollUntilAvailable( () => Promise.resolve( 404 ), {
			capMs: 3000,
			intervalMs: 1000,
			clock: fakeClock(),
		} );
		expect( result.recoveredAfterMs ).toBeNull();
		expect( result.lastStatus ).toBe( 404 );
	} );

	test( 'treats a network error (-1) as not-yet-available and keeps polling', async () => {
		const statuses = [ -1, -1, 200 ];
		let i = 0;
		const result = await pollUntilAvailable( () => Promise.resolve( statuses[ i++ ] ), {
			capMs: 10000,
			intervalMs: 500,
			clock: fakeClock(),
		} );
		expect( result ).toEqual( { recoveredAfterMs: 1000, lastStatus: 200 } );
	} );

	test( 'enforces a strict cap: no poll starts past the budget, remaining is passed down', async () => {
		const remainingSeen: number[] = [];
		const result = await pollUntilAvailable(
			( remainingMs ) => {
				remainingSeen.push( remainingMs );
				return Promise.resolve( 404 );
			},
			{ capMs: 3000, intervalMs: 1000, clock: fakeClock() }
		);
		// Polls at elapsed 0, 1000, 2000; the sleep to 3000 exhausts the budget so no
		// fourth poll runs.
		expect( remainingSeen ).toEqual( [ 3000, 2000, 1000 ] );
		expect( result.recoveredAfterMs ).toBeNull();
		expect( result.lastStatus ).toBe( 404 );
	} );
} );

describe( 'formatAvailabilityProbe', () => {
	test( 'renders recovered and not-recovered targets', () => {
		const probe: AvailabilityProbe = {
			capMs: 20000,
			measuredFrom: 'publish',
			targets: [
				{ label: 'permalink-authenticated', recoveredMs: 4200, lastStatus: 200 },
				{ label: 'permalink-anonymous', recoveredMs: null, lastStatus: 404 },
				{ label: 'rest-by-id', recoveredMs: 800, lastStatus: 200 },
			],
		};

		const output = formatAvailabilityProbe( probe );

		expect( output ).toContain( 'Availability probe (cap 20000ms):' );
		expect( output ).toContain( 'permalink-authenticated: recovered after 4200ms (since publish)' );
		expect( output ).toContain(
			'permalink-anonymous: not recovered within 20000ms (last status 404)'
		);
		expect( output ).toContain( 'rest-by-id: recovered after 800ms (since publish)' );
	} );
} );
