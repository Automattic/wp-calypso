import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import * as teamcity from '../lib/teamcity';
import {
	debugThrottle,
	detectThrottle,
	formatThrottleLine,
	isThrottled,
	parseBanDurationMs,
	parseThrottleLine,
	raiseFlag,
	readActiveThrottles,
	resetRaisedThrottles,
	throttleExpiry,
	throttleEnvVar,
	throttleTag,
} from '../lib/throttle-flags';

let tagOwnBuild: jest.SpiedFunction< typeof teamcity.tagOwnBuild >;
let fetchBuildsByTag: jest.SpiedFunction< typeof teamcity.fetchBuildsByTag >;
let fetchBuildLog: jest.SpiedFunction< typeof teamcity.fetchBuildLog >;
let warn: jest.SpiedFunction< typeof console.warn >;

const NOW = 1_000_000;

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
		expect( parseThrottleLine( line ) ).toEqual( flag );
	} );

	test( 'survives the prefix TeamCity puts on a log line', () => {
		expect(
			parseThrottleLine(
				'[12:42:34]\t [Output for e2e] [e2e-throttle] type=domain-suggestions start=1 duration=2 end=3'
			)
		).toEqual( {
			id: 'domain-suggestions',
			raisedAtMs: 1,
			durationMs: 2,
			expiresAtMs: 3,
		} );
	} );

	test( 'ignores anything else, including an unknown type', () => {
		expect( parseThrottleLine( 'ordinary log output' ) ).toBeNull();
		expect(
			parseThrottleLine( '[e2e-throttle] type=made-up start=1 duration=2 end=3' )
		).toBeNull();
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

		expect( warn ).toHaveBeenCalledWith( expect.stringContaining( 'duration=3600000' ) );
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
		expect( isThrottled( 'signup' ) ).toBe( false );
		await raiseFlag( 'signup', 600_000 );

		expect( isThrottled( 'signup' ) ).toBe( true );
		expect( throttleExpiry( 'signup' ) ).toBe( NOW + 600_000 );
		expect( isThrottled( 'signup', NOW + 600_001 ) ).toBe( false );
	} );

	test( 'a throttle this worker raised is reported with its length', async () => {
		await raiseFlag( 'signup', 600_000 );
		warn.mockClear();

		debugThrottle( 'signup', NOW + 570_000 );

		expect( warn ).toHaveBeenCalledWith(
			expect.stringContaining( '600000ms (~10 minutes), ~30 seconds left' )
		);
	} );

	test( 'the report is not mistaken for the line a reader parses', async () => {
		await raiseFlag( 'signup', 600_000 );
		warn.mockClear();
		debugThrottle( 'signup' );

		expect( parseThrottleLine( warn.mock.calls[ 0 ][ 0 ] as string ) ).toBeNull();
	} );

	test( 'a failed tag never reaches the test', async () => {
		tagOwnBuild.mockRejectedValue( new Error( 'TeamCity is down' ) );

		await expect( raiseFlag( 'signup' ) ).resolves.toBeUndefined();
	} );

	test( 'a refused tag is reported as a status, never as an error', async () => {
		tagOwnBuild.mockResolvedValue( 403 );

		await raiseFlag( 'signup' );

		expect( warn ).toHaveBeenCalledWith( expect.stringContaining( '403' ) );
	} );
} );

describe( 'reading the published throttle', () => {
	test( 'an empty variable means checked and clear, and reports nothing', () => {
		process.env.THROTTLE_SIGNUP_EXPIRATION = '';

		expect( isThrottled( 'signup' ) ).toBe( false );
		debugThrottle( 'signup' );
		expect( warn ).not.toHaveBeenCalled();
	} );

	test( 'an expiry in the future is reported, with no duration to report', () => {
		process.env.THROTTLE_SIGNUP_EXPIRATION = String( NOW + 540_000 );

		expect( isThrottled( 'signup' ) ).toBe( true );
		debugThrottle( 'signup' );

		expect( warn ).toHaveBeenCalledWith(
			'[e2e-throttle-debug] signup is throttled: unknown duration, ~9 minutes left, until 1970-01-01T00:25:40.000Z.'
		);
	} );

	test( 'an expiry in the past is spent', () => {
		process.env.THROTTLE_SIGNUP_EXPIRATION = String( NOW - 1 );

		expect( isThrottled( 'signup' ) ).toBe( false );
	} );

	test( 'a throttle on one id says nothing about another', () => {
		process.env.THROTTLE_SIGNUP_EXPIRATION = String( NOW + 60_000 );

		expect( isThrottled( 'domain-suggestions' ) ).toBe( false );
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
			tag === 'throttle-signup' ? [ 11, 22 ] : null
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
			tag === 'throttle-signup' ? [ 11 ] : null
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

	test( 'a failed lookup is read as no throttle rather than retried', async () => {
		fetchBuildsByTag.mockResolvedValue( null );

		expect( ( await readActiveThrottles() ).signup ).toBeNull();
		expect( fetchBuildsByTag ).toHaveBeenCalledTimes( 3 );
	} );

	test( 'a tagged build with no readable line bans for the documented length from now', async () => {
		fetchBuildsByTag.mockImplementation( async ( tag ) =>
			tag === 'throttle-signup' ? [ 11 ] : null
		);
		fetchBuildLog.mockResolvedValue( 'a log with nothing of ours in it' );

		// The tag is proof the ban happened; only its timing is missing.
		expect( ( await readActiveThrottles() ).signup ).toBe( NOW + 3_600_000 );
	} );

	test( 'an unreadable log is treated the same way', async () => {
		fetchBuildsByTag.mockImplementation( async ( tag ) =>
			tag === 'throttle-domain-suggestions' ? [ 11 ] : null
		);
		fetchBuildLog.mockResolvedValue( null );

		expect( ( await readActiveThrottles() )[ 'domain-suggestions' ] ).toBe( NOW + 60_000 );
	} );

	test( 'a tag whose ban has already lapsed is not reported', async () => {
		fetchBuildsByTag.mockImplementation( async ( tag ) =>
			tag === 'throttle-signup' ? [ 11 ] : null
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
		[ { error: 'throttled' }, { id: 'signup', durationMs: 3_600_000 } ],
		[
			{ error: 'domain_suggestions_throttled', message: 'You can try again in 1 minute.' },
			{ id: 'domain-suggestions', durationMs: 60_000 },
		],
		[
			{ error: 'domain_availability_throttle', message: 'Limit reached.' },
			{ id: 'domain-availability', durationMs: 60_000 },
		],
		[
			{ url: '/domains/example/is-available', status: 429, body: 'Limit reached.' },
			{ id: 'domain-availability', durationMs: 60_000 },
		],
		// The endpoint wins over the generic code: this is not a signup ban.
		[
			{ url: '/domains/example/is-available', status: 429, body: '{"error":"throttled"}' },
			{ id: 'domain-availability', durationMs: 60_000 },
		],
		[
			{ url: '/domains/suggestions?q=x', status: 429, body: '{"error":"throttled"}' },
			{ id: 'domain-suggestions', durationMs: 60_000 },
		],
	] )( 'maps %#', ( value, expected ) => {
		expect( detectThrottle( value ) ).toEqual( expected );
	} );

	test( 'an ordinary response is not a throttle', () => {
		expect( detectThrottle( { success: true } ) ).toBeNull();
		expect( detectThrottle( new Error( 'network down' ) ) ).toBeNull();
	} );
} );
