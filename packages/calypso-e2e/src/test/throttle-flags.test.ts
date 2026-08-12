import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import * as teamcity from '../lib/teamcity';
import {
	debugThrottle,
	detectThrottle,
	flagsInLog,
	formatThrottleLine,
	parseBanDurationMs,
	raiseFlag,
	readActiveThrottles,
	resetRaisedThrottles,
	throttleEnvVar,
	throttleTag,
} from '../lib/throttle-flags';
import type { ThrottleId } from '../lib/throttle-flags';

let tagOwnBuild: jest.SpiedFunction< typeof teamcity.tagOwnBuild >;
let fetchBuildsByTag: jest.SpiedFunction< typeof teamcity.fetchBuildsByTag >;
let fetchBuildLog: jest.SpiedFunction< typeof teamcity.fetchBuildLog >;
let warn: jest.SpiedFunction< typeof console.warn >;

const NOW = 1_000_000;

/**
 * What `debugThrottle` reports, or null when it finds no throttle in force. The
 * report is the only thing a caller reads a throttle through.
 */
function reported( id: ThrottleId, nowMs?: number ): string | null {
	warn.mockClear();
	debugThrottle( id, nowMs );
	return ( warn.mock.calls[ 0 ]?.[ 0 ] as string ) ?? null;
}

/**
 * A tagged build as `fetchBuildsByTag` returns it.
 */
function taggedBuild( id: number, finishedAtMs: number | null = null ): teamcity.TaggedBuild {
	return { id, finishedAtMs };
}

beforeEach( () => {
	jest.spyOn( Date, 'now' ).mockReturnValue( NOW );
	tagOwnBuild = jest.spyOn( teamcity, 'tagOwnBuild' ).mockResolvedValue( 200 );
	fetchBuildsByTag = jest.spyOn( teamcity, 'fetchBuildsByTag' ).mockResolvedValue( null );
	fetchBuildLog = jest.spyOn( teamcity, 'fetchBuildLog' ).mockResolvedValue( null );
	warn = jest.spyOn( console, 'warn' ).mockImplementation( () => undefined );
	for ( const id of [ 'SIGNUP', 'DOMAIN_SUGGESTIONS', 'DOMAIN_AVAILABILITY' ] ) {
		delete process.env[ `THROTTLE_${ id }_EXPIRATION` ];
	}
	resetRaisedThrottles();
} );

afterEach( () => {
	jest.restoreAllMocks();
} );

describe( 'the log line', () => {
	test( 'round-trips', () => {
		const flag = {
			id: 'signup' as const,
			raisedAtMs: 1_000,
			durationMs: 600_000,
			expiresAtMs: 601_000,
		};
		const line = formatThrottleLine( flag );

		expect( line ).toBe( '[e2e-throttle] type=signup start=1000 duration=600000 end=601000' );
		expect( flagsInLog( line ).get( 'signup' ) ).toEqual( flag );
	} );

	test( 'survives the prefix TeamCity puts on a log line', () => {
		expect(
			flagsInLog(
				'[12:42:34]\t [Output for e2e] [e2e-throttle] type=domain-suggestions start=1 duration=2 end=3'
			).get( 'domain-suggestions' )
		).toEqual( {
			id: 'domain-suggestions',
			raisedAtMs: 1,
			durationMs: 2,
			expiresAtMs: 3,
		} );
	} );

	test( 'ignores anything else, including an unknown type', () => {
		expect( flagsInLog( 'ordinary log output' ).size ).toBe( 0 );
		expect( flagsInLog( '[e2e-throttle] type=made-up start=1 duration=2 end=3' ).size ).toBe( 0 );
	} );

	test( 'ignores an expiry no date can hold, as a mangled line leaves', () => {
		expect(
			flagsInLog( '[e2e-throttle] type=signup start=1 duration=2 end=17700000000000000000' ).size
		).toBe( 0 );
	} );

	test( 'takes the longest-lived line per id, whatever order they were printed', () => {
		const flags = flagsInLog(
			[
				'[e2e-throttle] type=signup start=1 duration=2 end=1700000',
				'[e2e-throttle] type=signup start=1 duration=2 end=1600000',
				'[e2e-throttle] type=domain-suggestions start=1 duration=2 end=1500000',
			].join( '\n' )
		);

		expect( flags.get( 'signup' )?.expiresAtMs ).toBe( 1_700_000 );
		expect( flags.get( 'domain-suggestions' )?.expiresAtMs ).toBe( 1_500_000 );
	} );
} );

describe( 'raiseFlag', () => {
	test( 'tags the build generically and reports the detail in the log', async () => {
		await raiseFlag( 'signup', 600_000 );

		expect( tagOwnBuild ).toHaveBeenCalledWith( 'throttle-signup' );
		expect( warn ).toHaveBeenCalledWith(
			'[e2e-throttle] type=signup start=1000000 duration=600000 end=1600000'
		);
	} );

	test( 'falls back to the documented ban length when none is given', async () => {
		await raiseFlag( 'signup' );

		expect( warn ).toHaveBeenCalledWith( expect.stringContaining( 'duration=600000' ) );
	} );

	test( 'a worker tags and reports each throttle at most once', async () => {
		await raiseFlag( 'domain-suggestions' );
		await raiseFlag( 'domain-suggestions' );
		await raiseFlag( 'signup' );

		expect( tagOwnBuild.mock.calls.flat() ).toEqual( [
			'throttle-domain-suggestions',
			'throttle-signup',
		] );
	} );

	test( 'what a worker raised is throttled for that worker straight away', async () => {
		expect( reported( 'signup' ) ).toBeNull();
		await raiseFlag( 'signup', 600_000 );

		expect( reported( 'signup' ) ).toContain( 'signup is throttled' );
		expect( reported( 'signup', NOW + 600_001 ) ).toBeNull();
	} );

	test( 'a throttle this worker raised is reported with its length', async () => {
		await raiseFlag( 'signup', 600_000 );

		expect( reported( 'signup', NOW + 570_000 ) ).toContain(
			'600000ms (~10 minutes), ~30 seconds left'
		);
	} );

	test( 'the report is not mistaken for the line a reader parses', async () => {
		await raiseFlag( 'signup', 600_000 );
		warn.mockClear();
		debugThrottle( 'signup' );

		expect( flagsInLog( warn.mock.calls[ 0 ][ 0 ] as string ).size ).toBe( 0 );
	} );

	test( 'a failed tag never reaches the test, and is tried again', async () => {
		tagOwnBuild.mockRejectedValueOnce( new Error( 'TeamCity is down' ) );

		await expect( raiseFlag( 'signup' ) ).resolves.toBeUndefined();
		await raiseFlag( 'signup' );

		expect( tagOwnBuild ).toHaveBeenCalledTimes( 2 );
	} );

	test( 'a build that could not be tagged still knows about the ban itself', async () => {
		tagOwnBuild.mockResolvedValue( 403 );

		await raiseFlag( 'signup', 600_000 );
		await raiseFlag( 'signup', 600_000 );

		// One line, however many times the tag is tried: a peer reading the log
		// must not see the same ban restarting.
		expect(
			warn.mock.calls.filter( ( [ line ] ) => /^\[e2e-throttle]/.test( String( line ) ) )
		).toHaveLength( 1 );
		expect( reported( 'signup' ) ).toContain( 'signup is throttled' );
	} );

	test( 'a local run has nothing to tag, and does not keep asking', async () => {
		tagOwnBuild.mockResolvedValue( null );

		await raiseFlag( 'signup' );
		await raiseFlag( 'signup' );

		expect( tagOwnBuild ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'a refused tag is reported as a status, never as an error', async () => {
		tagOwnBuild.mockResolvedValue( 403 );

		await raiseFlag( 'signup' );

		expect( warn ).toHaveBeenCalledWith( expect.stringContaining( '403' ) );
	} );

	test( 'a refused tag is tried again, so a peer can still find this build', async () => {
		tagOwnBuild.mockResolvedValueOnce( 502 );

		// One detection, because a worker can hit a throttle once and then run
		// nothing that touches it again.
		await raiseFlag( 'signup' );

		expect( tagOwnBuild ).toHaveBeenCalledTimes( 2 );
	} );

	test( 'a burst of refusals is one attempt at the tag, not several', async () => {
		tagOwnBuild.mockResolvedValue( 403 );

		// What a keystroke-per-request endpoint does: several land in one tick, and
		// share one go at the tag rather than spending an attempt each.
		await Promise.all( [ raiseFlag( 'signup' ), raiseFlag( 'signup' ), raiseFlag( 'signup' ) ] );

		expect( tagOwnBuild ).toHaveBeenCalledTimes( 2 );
	} );

	test( 'a tag that keeps being refused is given up on, not asked forever', async () => {
		tagOwnBuild.mockResolvedValue( 403 );

		for ( let attempt = 0; attempt < 4; attempt++ ) {
			await raiseFlag( 'signup' );
		}

		// Each retry is a request a test's teardown waits on.
		expect( tagOwnBuild ).toHaveBeenCalledTimes( 3 );
	} );

	test( 'a later response stating a longer ban replaces the first guess', async () => {
		await raiseFlag( 'domain-suggestions' );
		await raiseFlag( 'domain-suggestions', 1_800_000 );

		expect( warn ).toHaveBeenCalledWith( expect.stringContaining( 'duration=1800000' ) );
		expect( reported( 'domain-suggestions' ) ).toContain( '~30 minutes left' );
	} );

	test( 'a ban refused again before it lapses runs from the later refusal', async () => {
		let clock = NOW;
		jest.spyOn( Date, 'now' ).mockImplementation( () => clock );

		await raiseFlag( 'signup', 600_000 );
		clock += 500_000;
		warn.mockClear();
		await raiseFlag( 'signup', 600_000 );

		// The line stays as printed: a peer must not read the ban restarting.
		expect(
			warn.mock.calls.filter( ( [ line ] ) => /^\[e2e-throttle]/.test( String( line ) ) )
		).toHaveLength( 0 );
		expect( reported( 'signup', clock + 599_000 ) ).toContain( 'signup is throttled' );
	} );

	test( 'a later response stating a shorter ban does not cut the first short', async () => {
		await raiseFlag( 'domain-suggestions', 1_800_000 );
		warn.mockClear();

		await raiseFlag( 'domain-suggestions', 60_000 );

		expect( warn ).not.toHaveBeenCalled();
	} );
} );

describe( 'reading the published throttle', () => {
	test( 'an empty variable means checked and clear, and reports nothing', () => {
		process.env.THROTTLE_SIGNUP_EXPIRATION = '';

		expect( reported( 'signup' ) ).toBeNull();
	} );

	test( 'an expiry in the future is reported, with no duration to report', () => {
		process.env.THROTTLE_SIGNUP_EXPIRATION = String( NOW + 540_000 );

		expect( reported( 'signup' ) ).toBe(
			'[e2e-throttle-debug] signup is throttled: unknown duration, ~9 minutes left, until 1970-01-01T00:25:40.000Z.'
		);
	} );

	test( 'an expiry in the past is spent', () => {
		process.env.THROTTLE_SIGNUP_EXPIRATION = String( NOW - 1 );

		expect( reported( 'signup' ) ).toBeNull();
	} );

	test( 'a throttle on one id says nothing about another', () => {
		process.env.THROTTLE_SIGNUP_EXPIRATION = String( NOW + 60_000 );

		expect( reported( 'domain-suggestions' ) ).toBeNull();
	} );

	test( 'the variable name matches what the setup project writes', () => {
		expect( throttleEnvVar( 'domain-suggestions' ) ).toBe(
			'THROTTLE_DOMAIN_SUGGESTIONS_EXPIRATION'
		);
		expect( throttleTag( 'domain-suggestions' ) ).toBe( 'throttle-domain-suggestions' );
	} );
} );

describe( 'readActiveThrottles', () => {
	test( 'takes the furthest expiry across every tagged build', async () => {
		fetchBuildsByTag.mockImplementation( async ( tag ) =>
			tag === 'throttle-signup' ? [ taggedBuild( 11 ), taggedBuild( 22 ) ] : null
		);
		fetchBuildLog.mockImplementation( async ( buildId ) =>
			buildId === 11
				? '[e2e-throttle] type=signup start=1 duration=2 end=1600000'
				: '[e2e-throttle] type=signup start=1 duration=2 end=1700000'
		);

		expect( await readActiveThrottles() ).toEqual( {
			signup: 1_700_000,
			'domain-suggestions': null,
			'domain-availability': null,
		} );
	} );

	test( 'ignores lines belonging to another throttle', async () => {
		fetchBuildsByTag.mockImplementation( async ( tag ) =>
			tag === 'throttle-signup' ? [ taggedBuild( 11 ) ] : null
		);
		fetchBuildLog.mockResolvedValue(
			[
				'[e2e-throttle] type=domain-suggestions start=1 duration=2 end=9000000',
				'[e2e-throttle] type=signup start=1 duration=2 end=1600000',
			].join( '\n' )
		);

		expect( ( await readActiveThrottles() ).signup ).toBe( 1_600_000 );
	} );

	test( 'no tagged builds means no throttle, and the log is never fetched', async () => {
		fetchBuildsByTag.mockResolvedValue( [] );

		expect( await readActiveThrottles() ).toEqual( {
			signup: null,
			'domain-suggestions': null,
			'domain-availability': null,
		} );
		expect( fetchBuildLog ).not.toHaveBeenCalled();
	} );

	test( 'no TeamCity build around it is no throttle, and is not retried', async () => {
		fetchBuildsByTag.mockResolvedValue( null );

		expect( ( await readActiveThrottles() ).signup ).toBeNull();
		expect( fetchBuildsByTag ).toHaveBeenCalledTimes( 3 );
	} );

	test( 'a refused lookup is reported, and keeps what the other ids found', async () => {
		fetchBuildsByTag.mockImplementation( async ( tag ) => {
			if ( tag === 'throttle-domain-suggestions' ) {
				throw new Error( 'status 403' );
			}
			return tag === 'throttle-signup' ? [ taggedBuild( 11 ) ] : null;
		} );
		fetchBuildLog.mockResolvedValue( '[e2e-throttle] type=signup start=1 duration=2 end=1600000' );

		expect( await readActiveThrottles() ).toEqual( {
			signup: 1_600_000,
			'domain-suggestions': null,
			'domain-availability': null,
		} );
		expect( warn ).toHaveBeenCalledWith( expect.stringContaining( '403' ) );
	} );

	test( 'a tagged build with no readable line bans from when that build finished', async () => {
		fetchBuildsByTag.mockImplementation( async ( tag ) =>
			tag === 'throttle-signup' ? [ taggedBuild( 11, NOW - 60_000 ) ] : null
		);
		fetchBuildLog.mockResolvedValue( 'a log with nothing of ours in it' );

		// The tag is proof the ban happened; only its timing is missing. Anchored
		// to the build, so a build that reads the tag later does not restart it.
		expect( ( await readActiveThrottles() ).signup ).toBe( NOW - 60_000 + 600_000 );
	} );

	test( 'a running build with no readable line is not guessed at', async () => {
		fetchBuildsByTag.mockImplementation( async ( tag ) =>
			tag === 'throttle-domain-suggestions' ? [ taggedBuild( 11 ) ] : null
		);
		fetchBuildLog.mockResolvedValue( null );

		// Assuming a ban from now would republish it, always fresh, for as long as
		// that build keeps running.
		expect( ( await readActiveThrottles() )[ 'domain-suggestions' ] ).toBeNull();
	} );

	test( 'a build whose fallback has run out is not reported', async () => {
		fetchBuildsByTag.mockImplementation( async ( tag ) =>
			tag === 'throttle-signup' ? [ taggedBuild( 11, NOW - 600_001 ) ] : null
		);
		fetchBuildLog.mockResolvedValue( null );

		expect( ( await readActiveThrottles() ).signup ).toBeNull();
	} );

	test( 'a log we could not read still leaves the tag it was found by', async () => {
		fetchBuildsByTag.mockImplementation( async ( tag ) =>
			tag === 'throttle-signup' ? [ taggedBuild( 11, NOW - 60_000 ) ] : null
		);
		fetchBuildLog.mockRejectedValue( new Error( 'status 401' ) );

		// Not reading a log is less than reading one and finding nothing in it, so
		// it cannot answer more confidently than that does.
		expect( ( await readActiveThrottles() ).signup ).toBe( NOW - 60_000 + 600_000 );
		expect( warn ).toHaveBeenCalledWith( expect.stringContaining( '401' ) );
	} );

	test( 'a build there was no time to read counts on its tag, and says so', async () => {
		let clock = NOW;
		jest.spyOn( Date, 'now' ).mockImplementation( () => clock );
		fetchBuildsByTag.mockImplementation( async ( tag ) =>
			tag === 'throttle-signup' ? [ taggedBuild( 11, NOW - 60_000 ), taggedBuild( 22, NOW ) ] : null
		);
		// The first read spends the whole budget.
		fetchBuildLog.mockImplementation( async () => {
			clock += 60_000;
			return 'a log with nothing of ours in it';
		} );

		expect( ( await readActiveThrottles( NOW ) ).signup ).toBe( NOW + 600_000 );
		expect( fetchBuildLog ).toHaveBeenCalledTimes( 1 );
		expect( warn ).toHaveBeenCalledWith( expect.stringContaining( 'Ran out of time to read 1' ) );
	} );

	test( 'one unreadable build does not throw away what the others said', async () => {
		fetchBuildsByTag.mockImplementation( async ( tag ) =>
			tag === 'throttle-signup' ? [ taggedBuild( 11 ), taggedBuild( 22 ) ] : null
		);
		fetchBuildLog.mockImplementation( async ( buildId ) => {
			if ( buildId === 22 ) {
				throw new Error( 'status 404' );
			}
			return '[e2e-throttle] type=signup start=1 duration=2 end=1600000';
		} );

		expect( ( await readActiveThrottles() ).signup ).toBe( 1_600_000 );
	} );

	test( 'the id that asks first may spend the whole budget, not a share of it', async () => {
		let clock = NOW;
		jest.spyOn( Date, 'now' ).mockImplementation( () => clock );
		fetchBuildsByTag.mockImplementation( async ( tag ) =>
			tag === 'throttle-signup' ? [ taggedBuild( 11 ), taggedBuild( 22 ) ] : null
		);
		// A read costs more than a third of the budget and less than all of it, so
		// the second build is only reached if signup was not held to a third.
		fetchBuildLog.mockImplementation( async ( buildId ) => {
			clock += 8_000;
			return buildId === 22
				? '[e2e-throttle] type=signup start=1 duration=2 end=1600000'
				: 'a log with nothing of ours in it';
		} );

		expect( ( await readActiveThrottles( NOW ) ).signup ).toBe( 1_600_000 );
		expect( fetchBuildLog ).toHaveBeenCalledTimes( 2 );
	} );

	test( 'a build tagged for more than one throttle has its log read once', async () => {
		fetchBuildsByTag.mockResolvedValue( [ taggedBuild( 11 ) ] );
		fetchBuildLog.mockResolvedValue( '[e2e-throttle] type=signup start=1 duration=2 end=1600000' );

		await readActiveThrottles();

		expect( fetchBuildLog ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'a tag whose ban has already lapsed is not reported', async () => {
		fetchBuildsByTag.mockImplementation( async ( tag ) =>
			tag === 'throttle-signup' ? [ taggedBuild( 11 ) ] : null
		);
		fetchBuildLog.mockResolvedValue( '[e2e-throttle] type=signup start=1 duration=2 end=999999' );

		expect( ( await readActiveThrottles() ).signup ).toBeNull();
	} );
} );

describe( 'detectThrottle', () => {
	test( 'reads the ban length wpcom states', () => {
		expect(
			parseBanDurationMs(
				'Limit reached. You can try again in 10 minutes. Trying again before that will only increase the time you have to wait.'
			)
		).toBe( 600_000 );
		expect( parseBanDurationMs( 'Limit reached.' ) ).toBeNull();
	} );

	test.each( [
		[
			{ error: 'throttled', message: 'Limit reached. You can try again in 10 minutes.' },
			{ id: 'signup', durationMs: 600_000 },
		],
		// A refusal that is not JSON reaches `sendRequest` as an unparseable body,
		// so it arrives as the message alone rather than as a code.
		[
			new Error( 'Failed to parse JSON: Limit reached. You can try again in 60 minutes.' ),
			{ id: 'signup', durationMs: 3_600_000 },
		],
		[
			{ error: 'domain_suggestions_throttled', message: 'You can try again in 1 minute.' },
			{ id: 'domain-suggestions', durationMs: 60_000 },
		],
		[
			{ error: 'domain_availability_throttle', message: 'Limit reached.' },
			{ id: 'domain-availability', durationMs: 3_600_000 },
		],
		[
			{ url: '/domains/example/is-available', status: 429, body: 'Limit reached.' },
			{ id: 'domain-availability', durationMs: 3_600_000 },
		],
		// The endpoint wins over the generic code: this is not a signup ban.
		[
			{ url: '/domains/example/is-available', status: 429, body: '{"error":"throttled"}' },
			{ id: 'domain-availability', durationMs: 3_600_000 },
		],
		[
			{ url: '/domains/suggestions?q=x', status: 429, body: '{"error":"throttled"}' },
			{ id: 'domain-suggestions', durationMs: 60_000 },
		],
	] )( 'maps %#', ( value, expected ) => {
		expect( detectThrottle( value ) ).toEqual( expected );
	} );

	test( 'a Blackbox block is not an IP ban', () => {
		expect( detectThrottle( { error: 'throttled' } ) ).toBeNull();
		expect(
			detectThrottle( {
				url: 'https://public-api.wordpress.com/rest/v1.1/users/new',
				status: 403,
				body: '{"error":"throttled","message":"Too many attempts. Please wait a moment and try again."}',
			} )
		).toBeNull();
	} );

	test( 'the same code on /sites/new is, whatever language it came in', () => {
		// Nothing else raises `throttled` there, so the sentence is not needed —
		// which is what a ban stated in another language comes down to.
		expect(
			detectThrottle( {
				url: 'https://public-api.wordpress.com/rest/v1.1/sites/new',
				status: 403,
				body: '{"error":"throttled","message":"Límite alcanzado."}',
			} )
		).toEqual( { id: 'signup', durationMs: 600_000 } );
	} );

	test( 'an endpoint the payload does not name is taken from the caller', () => {
		// How the Node client records: it holds the URL, the body does not.
		expect(
			detectThrottle(
				{ error: 'throttled' },
				'https://public-api.wordpress.com/rest/v1.1/sites/new'
			)
		).toEqual( { id: 'signup', durationMs: 600_000 } );
		expect(
			detectThrottle( new Error( 'throttled' ), 'https://x/rest/v1.1/users/new' )
		).toBeNull();
	} );

	// The sentence is wpcom's own, and the number in it is what gets recorded.
	test.each( [
		[
			{
				url: 'https://public-api.wordpress.com/rest/v1.1/sites/new',
				status: 403,
				body: '{"error":"throttled","message":"Limit reached. You can try again in 10 minutes. Trying again before that will only increase the time you have to wait before the ban is lifted."}',
			},
			{ id: 'signup', durationMs: 600_000 },
		],
		[
			{
				url: 'https://public-api.wordpress.com/rest/v1.1/users/new',
				status: 403,
				body: '{"error":"throttled","message":"Limit reached. You can try again in 10 minutes. Trying again before that will only increase the time you have to wait before the ban is lifted."}',
			},
			{ id: 'signup', durationMs: 600_000 },
		],
		[
			{
				url: 'https://public-api.wordpress.com/rest/v1.1/domains/suggestions?query=x',
				status: 403,
				body: '{"error":"domain_suggestions_throttled","message":"Limit reached. You can try again in 1 minutes."}',
			},
			{ id: 'domain-suggestions', durationMs: 60_000 },
		],
		[
			{
				url: 'https://public-api.wordpress.com/rest/v1.3/domains/example.com/is-available?is_cart_pre_check=false',
				status: 429,
				body: '{"error":"domain_availability_throttle","message":"Limit reached."}',
			},
			{ id: 'domain-availability', durationMs: 3_600_000 },
		],
	] )( 'maps the bodies wpcom really sends %#', ( value, expected ) => {
		expect( detectThrottle( value ) ).toEqual( expected );
	} );

	test( 'an ordinary response is not a throttle', () => {
		expect( detectThrottle( { success: true } ) ).toBeNull();
		expect( detectThrottle( new Error( 'network down' ) ) ).toBeNull();
	} );

	test( 'a gateway page talking about its upstream is not a ban', () => {
		expect(
			detectThrottle( {
				url: '/sites/new',
				status: 502,
				body: '<html><body>Request throttled by upstream.</body></html>',
			} )
		).toBeNull();
	} );

	test( 'the page wp_die draws for the same ban is one', () => {
		// What `sendRequest` hands on when the refusal is not JSON at all.
		expect(
			detectThrottle(
				new Error(
					'Failed to parse JSON: <!DOCTYPE html><html><body><h1>Limit reached.</h1>' +
						'<p>You can try again in 60 minutes.</p></body></html>'
				)
			)
		).toEqual( { id: 'signup', durationMs: 3_600_000 } );
	} );

	test( 'a page that merely reads "limit reached" is not a ban', () => {
		expect(
			detectThrottle( { url: '/sites/new', status: 503, body: '<h1>Limit reached</h1>' } )
		).toBeNull();
	} );

	test( 'a ban longer than any wpcom states is read as no stated length', () => {
		expect( parseBanDurationMs( 'try again in 999999999999 minutes' ) ).toBeNull();
	} );
} );
