import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import * as teamcity from '../lib/teamcity';
import {
	debugThrottle,
	detectThrottle,
	flagsInLog,
	flushThrottleWrites,
	formatThrottleLine,
	handleActiveThrottles,
	raiseFlag,
	readActiveThrottles,
	recordThrottle,
	registerThrottleActionHandler,
	resetRaisedThrottles,
	THROTTLE_ACTION_ENV_VARS,
	throttleAction,
	throttleActionMessage,
	throttleEnvVar,
	throttleTag,
	validateThrottleActions,
} from '../lib/throttle-flags';
import type { ThrottleId } from '../lib/throttle-flags';

let tagOwnBuild: jest.SpiedFunction< typeof teamcity.tagOwnBuild >;
let appendOwnBuildLog: jest.SpiedFunction< typeof teamcity.appendOwnBuildLog >;
let fetchBuildLog: jest.SpiedFunction< typeof teamcity.fetchBuildLog >;
let fetchBuildsByTag: jest.SpiedFunction< typeof teamcity.fetchBuildsByTag >;
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

/**
 * Every line the build was made to write, in order.
 */
function published(): string[] {
	return appendOwnBuildLog.mock.calls.map( ( [ text ] ) => text );
}

/**
 * A line in a build's log, as `publish` writes it.
 */
function states( id: ThrottleId, expiresAtMs: number ): string {
	return `[e2e-throttle] type=${ id } start=1 duration=2 end=${ expiresAtMs }`;
}

/**
 * Raises a flag and settles what it started. A worker never does this; these
 * tests do, because the write is the thing under test.
 */
async function raiseAndSettle( id: ThrottleId ): Promise< void > {
	raiseFlag( id );
	await flushThrottleWrites();
}

beforeEach( () => {
	jest.spyOn( Date, 'now' ).mockReturnValue( NOW );
	tagOwnBuild = jest.spyOn( teamcity, 'tagOwnBuild' ).mockResolvedValue( 200 );
	appendOwnBuildLog = jest.spyOn( teamcity, 'appendOwnBuildLog' ).mockResolvedValue( 200 );
	fetchBuildLog = jest.spyOn( teamcity, 'fetchBuildLog' ).mockResolvedValue( null );
	fetchBuildsByTag = jest.spyOn( teamcity, 'fetchBuildsByTag' ).mockResolvedValue( null );
	warn = jest.spyOn( console, 'warn' ).mockImplementation( () => undefined );
	for ( const id of [ 'SIGNUP', 'DOMAIN_SUGGESTIONS', 'DOMAIN_AVAILABILITY' ] ) {
		delete process.env[ `THROTTLE_${ id }_EXPIRATION` ];
		delete process.env[ `E2E_THROTTLE_${ id }_ACTION` ];
	}
	resetRaisedThrottles();
} );

describe( 'throttle actions', () => {
	test( 'maps each throttle to its public action variable', () => {
		expect( THROTTLE_ACTION_ENV_VARS ).toEqual( {
			signup: 'E2E_THROTTLE_SIGNUP_ACTION',
			'domain-suggestions': 'E2E_THROTTLE_DOMAIN_SUGGESTIONS_ACTION',
			'domain-availability': 'E2E_THROTTLE_DOMAIN_AVAILABILITY_ACTION',
		} );
	} );

	test( 'defaults to skip and accepts an explicit action', () => {
		expect( throttleAction( 'signup' ) ).toBe( 'skip' );
		process.env.E2E_THROTTLE_SIGNUP_ACTION = 'fail';
		expect( throttleAction( 'signup' ) ).toBe( 'fail' );
	} );

	test( 'startup validation rejects any value outside exact lowercase actions', () => {
		process.env.E2E_THROTTLE_DOMAIN_SUGGESTIONS_ACTION = 'FAIL';
		expect( validateThrottleActions ).toThrow(
			'Invalid E2E_THROTTLE_DOMAIN_SUGGESTIONS_ACTION value: FAIL. Expected skip or fail.'
		);
	} );

	test( 'does nothing for clear and expired signals', () => {
		const handler = jest.fn();
		const unregister = registerThrottleActionHandler( handler );
		process.env.THROTTLE_SIGNUP_EXPIRATION = String( NOW - 1 );
		handleActiveThrottles( [ 'signup', 'domain-suggestions' ] );
		unregister();
		expect( handler ).not.toHaveBeenCalled();
	} );

	test( 'uses the registered handler for an active throttle', () => {
		const handler = jest.fn();
		const unregister = registerThrottleActionHandler( handler );
		process.env.THROTTLE_SIGNUP_EXPIRATION = String( NOW + 1 );
		handleActiveThrottles( [ 'signup' ] );
		unregister();
		expect( handler ).toHaveBeenCalledWith( 'skip', [ 'signup' ] );
	} );

	test( 'states the ban and leaves the caller alone without a runner handler', () => {
		// No handler is a `beforeAll` or a setup project, where there is no one test
		// to skip. Applying nothing here is what keeps the policy per test.
		process.env.THROTTLE_SIGNUP_EXPIRATION = String( NOW + 1 );
		warn.mockClear();
		expect( () => handleActiveThrottles( [ 'signup' ], NOW ) ).not.toThrow();
		expect( warn.mock.calls[ 0 ]?.[ 0 ] ).toContain( 'signup is throttled' );
	} );

	test( 'names every selected throttle, and says so when the action is fail', () => {
		const clean = { errors: [] };
		expect( throttleActionMessage( 'skip', [ 'signup', 'domain-suggestions' ], clean ) ).toBe(
			'WordPress.com throttle active: signup, domain-suggestions.'
		);
		expect( throttleActionMessage( 'fail', [ 'signup' ], clean ) ).toBe(
			'WordPress.com throttle active: signup. E2E throttle action is fail.'
		);
	} );

	test( 'has nothing to say to a test that stopped for a reason of its own', () => {
		// The handler runs from fixture teardown too, so it meets tests that
		// already failed or skipped. `expectedStatus` covers the moment between
		// `skip` marking it and the status settling.
		expect(
			throttleActionMessage( 'fail', [ 'signup' ], { errors: [ new Error( 'own' ) ] } )
		).toBeNull();
		expect(
			throttleActionMessage( 'fail', [ 'signup' ], { errors: [], status: 'skipped' } )
		).toBeNull();
		expect(
			throttleActionMessage( 'fail', [ 'signup' ], { errors: [], expectedStatus: 'skipped' } )
		).toBeNull();
	} );

	test( 'gives fail precedence across active throttles', () => {
		const handler = jest.fn();
		const unregister = registerThrottleActionHandler( handler );
		process.env.THROTTLE_SIGNUP_EXPIRATION = String( NOW + 1 );
		process.env.THROTTLE_DOMAIN_SUGGESTIONS_EXPIRATION = String( NOW + 1 );
		process.env.E2E_THROTTLE_DOMAIN_SUGGESTIONS_ACTION = 'fail';
		handleActiveThrottles( [ 'signup', 'domain-suggestions' ] );
		unregister();
		expect( handler ).toHaveBeenCalledWith( 'fail', [ 'domain-suggestions' ] );
	} );
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
	test( 'writes the line, then tags the build generically', async () => {
		const order: string[] = [];
		appendOwnBuildLog.mockImplementation( async () => {
			order.push( 'wrote' );
			return 200;
		} );
		tagOwnBuild.mockImplementation( async () => {
			order.push( 'tagged' );
			return 200;
		} );

		await raiseAndSettle( 'signup' );

		expect( published() ).toEqual( [
			'[e2e-throttle] type=signup start=1000000 duration=600000 end=1600000',
		] );
		expect( tagOwnBuild ).toHaveBeenCalledWith( 'throttle-signup' );
		// A tag is what makes a build findable, so it must not arrive before there
		// is anything to find.
		expect( order ).toEqual( [ 'wrote', 'tagged' ] );
	} );

	test( 'the worker knows before any of that has happened', async () => {
		let settle: ( status: number ) => void = () => undefined;
		appendOwnBuildLog.mockImplementation(
			() => new Promise< number >( ( resolve ) => ( settle = resolve ) )
		);

		// Not awaited, and nothing has answered yet.
		const writing = raiseFlag( 'signup' );

		expect( reported( 'signup' ) ).toContain( 'signup is throttled' );
		expect( process.env[ throttleEnvVar( 'signup' ) ] ).toBe( String( NOW + 600_000 ) );
		expect( tagOwnBuild ).not.toHaveBeenCalled();

		settle( 200 );
		await writing;
	} );

	test( 'a line that could not be written leaves the build untagged', async () => {
		appendOwnBuildLog.mockRejectedValue( new Error( 'TeamCity is down' ) );

		// Never rejects: the promise is held by a teardown that settles it, and a
		// worker's own path drops it on the floor.
		await expect( raiseFlag( 'signup' ) ).resolves.toBeUndefined();

		// A build a peer can find but learn nothing from is worse than one it never
		// finds. The worker still knows: it ran into the ban itself.
		expect( tagOwnBuild ).not.toHaveBeenCalled();
		expect( reported( 'signup' ) ).toContain( 'signup is throttled' );
	} );

	test( 'a refused line is reported as a status, and leaves the build untagged', async () => {
		appendOwnBuildLog.mockResolvedValue( 403 );

		await raiseAndSettle( 'signup' );

		expect( tagOwnBuild ).not.toHaveBeenCalled();
		expect( warn ).toHaveBeenCalledWith( expect.stringContaining( '403' ) );
	} );

	test( 'the next restatement tries the write again', async () => {
		let clock = NOW;
		jest.spyOn( Date, 'now' ).mockImplementation( () => clock );
		appendOwnBuildLog.mockRejectedValueOnce( new Error( 'TeamCity is down' ) );

		await raiseAndSettle( 'signup' );
		clock += 60_001;
		await raiseAndSettle( 'signup' );

		expect( appendOwnBuildLog ).toHaveBeenCalledTimes( 2 );
		expect( tagOwnBuild ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'each write carries one line, and the log keeps them all', async () => {
		await raiseAndSettle( 'signup' );
		await raiseAndSettle( 'domain-suggestions' );

		// A log only grows, so a worker never has to restate what it already wrote
		// and cannot overwrite what another worker wrote.
		expect( published() ).toEqual( [
			'[e2e-throttle] type=signup start=1000000 duration=600000 end=1600000',
			'[e2e-throttle] type=domain-suggestions start=1000000 duration=60000 end=1060000',
		] );
	} );

	test( 'a local run has nothing to write, and still knows the ban itself', async () => {
		appendOwnBuildLog.mockResolvedValue( null );

		await raiseAndSettle( 'signup' );

		expect( reported( 'signup' ) ).toContain( 'signup is throttled' );
		expect( tagOwnBuild ).not.toHaveBeenCalled();
	} );

	test( 'a worker tags and reports each throttle at most once', async () => {
		await raiseAndSettle( 'domain-suggestions' );
		await raiseAndSettle( 'domain-suggestions' );
		await raiseAndSettle( 'signup' );

		expect( tagOwnBuild.mock.calls.flat() ).toEqual( [
			'throttle-domain-suggestions',
			'throttle-signup',
		] );
	} );

	test( 'what a worker raised is throttled for that worker straight away', async () => {
		expect( reported( 'signup' ) ).toBeNull();
		await raiseAndSettle( 'signup' );

		expect( reported( 'signup' ) ).toContain( 'signup is throttled' );
		expect( reported( 'signup', NOW + 600_001 ) ).toBeNull();
	} );

	test( 'a throttle this worker raised is reported with its length', async () => {
		await raiseAndSettle( 'signup' );

		expect( reported( 'signup', NOW + 570_000 ) ).toContain(
			'600000ms (~10 minutes), ~30 seconds left'
		);
	} );

	test( 'the report is not mistaken for the line a reader parses', async () => {
		await raiseAndSettle( 'signup' );
		warn.mockClear();
		debugThrottle( 'signup' );

		expect( flagsInLog( warn.mock.calls[ 0 ][ 0 ] as string ).size ).toBe( 0 );
	} );

	test( 'a failed tag never reaches the test, and is tried again', async () => {
		tagOwnBuild.mockRejectedValueOnce( new Error( 'TeamCity is down' ) );

		await expect( raiseFlag( 'signup' ) ).resolves.toBeUndefined();
		await raiseAndSettle( 'signup' );

		expect( tagOwnBuild ).toHaveBeenCalledTimes( 2 );
	} );

	test( 'a build that could not be tagged still knows about the ban itself', async () => {
		tagOwnBuild.mockResolvedValue( 403 );

		await raiseAndSettle( 'signup' );
		await raiseAndSettle( 'signup' );

		// Stated once, however many times the tag is tried: a peer reading it must
		// not see the same ban restarting.
		expect( published() ).toHaveLength( 1 );
		expect( reported( 'signup' ) ).toContain( 'signup is throttled' );
	} );

	test( 'a local run has nothing to tag, and does not keep asking', async () => {
		tagOwnBuild.mockResolvedValue( null );

		await raiseAndSettle( 'signup' );
		await raiseAndSettle( 'signup' );

		expect( tagOwnBuild ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'a refused tag is reported as a status, never as an error', async () => {
		tagOwnBuild.mockResolvedValue( 403 );

		await raiseAndSettle( 'signup' );

		expect( warn ).toHaveBeenCalledWith( expect.stringContaining( '403' ) );
	} );

	test( 'a refused tag is tried again, so a peer can still find this build', async () => {
		tagOwnBuild.mockResolvedValueOnce( 502 );

		// One detection, because a worker can hit a throttle once and then run
		// nothing that touches it again.
		await raiseAndSettle( 'signup' );

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
		let clock = NOW;
		jest.spyOn( Date, 'now' ).mockImplementation( () => clock );
		tagOwnBuild.mockResolvedValue( 403 );

		// Tagging hangs off writing, and a refusal inside the damping window writes
		// nothing, so the tries land a restatement apart rather than a refusal.
		for ( let attempt = 0; attempt < 4; attempt++ ) {
			await raiseAndSettle( 'signup' );
			clock += 60_001;
		}

		// Each retry is a request a worker's teardown waits on.
		expect( tagOwnBuild ).toHaveBeenCalledTimes( 3 );
	} );

	test( 'a ban refused again before it lapses runs from the later refusal', async () => {
		let clock = NOW;
		jest.spyOn( Date, 'now' ).mockImplementation( () => clock );

		await raiseAndSettle( 'signup' );
		clock += 500_000;
		warn.mockClear();
		await raiseAndSettle( 'signup' );

		// The later expiry is published, not just held: a peer reads what the build
		// states and nothing else, so a ban pushed out in silence is a ban a peer
		// sits out early.
		expect( published() ).toContain(
			'[e2e-throttle] type=signup start=1500000 duration=600000 end=2100000'
		);
		expect( reported( 'signup', clock + 599_000 ) ).toContain( 'signup is throttled' );
	} );

	test( 'a ban restated no more than ten times over its length', async () => {
		let clock = NOW;
		jest.spyOn( Date, 'now' ).mockImplementation( () => clock );

		// What a keystroke-per-request endpoint does to a log: a refusal every
		// 100ms for the length of the ban, which is 600 of them.
		for ( let refusal = 0; refusal < 600; refusal++ ) {
			await raiseAndSettle( 'domain-suggestions' );
			clock += 100;
		}

		expect( published() ).toHaveLength( 10 );
		// Still the ban this worker believes in, whatever was published.
		expect( reported( 'domain-suggestions' ) ).toContain( '~60 seconds left' );
	} );

	test( 'the same ban hit twice in a tick is stated once', async () => {
		await raiseAndSettle( 'domain-suggestions' );
		warn.mockClear();

		await raiseAndSettle( 'domain-suggestions' );

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
			buildId === 11 ? states( 'signup', 1_600_000 ) : states( 'signup', 1_700_000 )
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
			[ states( 'domain-suggestions', 9_000_000 ), states( 'signup', 1_600_000 ) ].join( '\n' )
		);

		expect( ( await readActiveThrottles() ).signup ).toBe( 1_600_000 );
	} );

	test( 'no tagged builds means no throttle, and no log is fetched', async () => {
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

	test( 'a refused lookup is left out, and keeps what the other ids found', async () => {
		fetchBuildsByTag.mockImplementation( async ( tag ) => {
			if ( tag === 'throttle-domain-suggestions' ) {
				throw new Error( 'status 403' );
			}
			return tag === 'throttle-signup' ? [ taggedBuild( 11 ) ] : null;
		} );
		fetchBuildLog.mockResolvedValue( states( 'signup', 1_600_000 ) );

		// Absent, not null: the id TeamCity refused is one this run cannot speak
		// for, and null is this run saying it looked and found nothing.
		expect( await readActiveThrottles() ).toEqual( {
			signup: 1_600_000,
			'domain-availability': null,
		} );
		expect( warn ).toHaveBeenCalledWith( expect.stringContaining( '403' ) );
	} );

	test( 'a tagged build whose log carries no line is passed over', async () => {
		fetchBuildsByTag.mockImplementation( async ( tag ) =>
			tag === 'throttle-domain-availability' ? [ taggedBuild( 11 ) ] : null
		);
		fetchBuildLog.mockResolvedValue( 'a log with nothing of ours in it' );

		// The tag says this build hit it; only a line says when the ban ends, and
		// a ban nobody wrote down is one nobody publishes.
		expect( ( await readActiveThrottles() )[ 'domain-availability' ] ).toBeNull();
	} );

	test( 'a finished build with no line is passed over too', async () => {
		fetchBuildsByTag.mockImplementation( async ( tag ) =>
			tag === 'throttle-signup' ? [ taggedBuild( 11, NOW - 60_000 ) ] : null
		);
		fetchBuildLog.mockResolvedValue( 'a log with nothing of ours in it' );

		// Its dates would date a ban from when it finished. That expiry is one no
		// build ever wrote, and the tag alone cannot tell a ban still in force from
		// one that ended before the build did.
		expect( ( await readActiveThrottles() ).signup ).toBeNull();
	} );

	test( 'a line whose ban has already lapsed is passed over', async () => {
		fetchBuildsByTag.mockImplementation( async ( tag ) =>
			tag === 'throttle-signup' ? [ taggedBuild( 11 ) ] : null
		);
		fetchBuildLog.mockResolvedValue( states( 'signup', NOW - 1 ) );

		expect( ( await readActiveThrottles() ).signup ).toBeNull();
	} );

	test( 'a log that could not be read is passed over, and said out loud', async () => {
		fetchBuildsByTag.mockImplementation( async ( tag ) =>
			tag === 'throttle-signup' ? [ taggedBuild( 11, NOW - 60_000 ) ] : null
		);
		fetchBuildLog.mockRejectedValue( new Error( 'status 401' ) );

		expect( ( await readActiveThrottles() ).signup ).toBeNull();
		expect( warn ).toHaveBeenCalledWith( expect.stringContaining( '401' ) );
	} );

	test( 'a build there was no time to read is passed over', async () => {
		let clock = NOW;
		jest.spyOn( Date, 'now' ).mockImplementation( () => clock );
		fetchBuildsByTag.mockImplementation( async ( tag ) =>
			tag === 'throttle-signup' ? [ taggedBuild( 11 ), taggedBuild( 22 ) ] : null
		);
		// The first read spends the whole budget.
		fetchBuildLog.mockImplementation( async ( buildId ) => {
			clock += 30_000;
			return buildId === 22 ? states( 'signup', 1_600_000 ) : 'nothing of ours';
		} );

		expect( ( await readActiveThrottles( NOW ) ).signup ).toBeNull();
		expect( fetchBuildLog ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'a build tagged for more than one throttle has its log read once', async () => {
		fetchBuildsByTag.mockResolvedValue( [ taggedBuild( 11 ) ] );
		fetchBuildLog.mockResolvedValue(
			[ states( 'signup', 1_600_000 ), states( 'domain-availability', 1_700_000 ) ].join( '\n' )
		);

		expect( await readActiveThrottles() ).toEqual( {
			signup: 1_600_000,
			'domain-suggestions': null,
			'domain-availability': 1_700_000,
		} );
		expect( fetchBuildLog ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'a throttle each on two builds is two throttles, not one', async () => {
		fetchBuildsByTag.mockImplementation( async ( tag ) => {
			if ( tag === 'throttle-signup' ) {
				return [ taggedBuild( 11 ) ];
			}
			return tag === 'throttle-domain-suggestions' ? [ taggedBuild( 22 ) ] : null;
		} );
		fetchBuildLog.mockImplementation( async ( buildId ) =>
			buildId === 11 ? states( 'signup', 1_600_000 ) : states( 'domain-suggestions', 1_700_000 )
		);

		expect( await readActiveThrottles() ).toEqual( {
			signup: 1_600_000,
			'domain-suggestions': 1_700_000,
			'domain-availability': null,
		} );
	} );

	test( 'one silent build does not throw away what another wrote', async () => {
		fetchBuildsByTag.mockImplementation( async ( tag ) =>
			tag === 'throttle-signup' ? [ taggedBuild( 11 ), taggedBuild( 22 ) ] : null
		);
		fetchBuildLog.mockImplementation( async ( buildId ) =>
			buildId === 11 ? states( 'signup', 1_600_000 ) : 'nothing of ours'
		);

		expect( ( await readActiveThrottles() ).signup ).toBe( 1_600_000 );
	} );
} );

describe( 'detectThrottle', () => {
	test.each( [
		[ { url: '/rest/v1.1/sites/new', status: 403, body: '{"error":"throttled"}' }, 'signup' ],
		[
			{ error: 'domain_suggestions_throttled', message: 'You can try again in 1 minute.' },
			'domain-suggestions',
		],
		[ { error: 'domain_availability_throttle', message: 'Limit reached.' }, 'domain-availability' ],
		// The endpoint wins over the generic code: this is not a signup ban.
		[
			{ url: '/domains/example/is-available', status: 429, body: '{"error":"throttled"}' },
			'domain-availability',
		],
		[
			{ url: '/domains/suggestions?q=x', status: 429, body: '{"error":"throttled"}' },
			'domain-suggestions',
		],
	] )( 'maps %#', ( value, expected ) => {
		expect( detectThrottle( value ) ).toEqual( expected );
	} );

	test( 'a message with no code behind it is not a ban', () => {
		// wpcom renders the message in whatever locale the caller asked for, so
		// nothing here reads it. Only the code and the endpoint decide.
		expect(
			detectThrottle( {
				url: '/domains/example/is-available',
				status: 429,
				body: 'Limit reached.',
			} )
		).toBeNull();
	} );

	test( 'nothing /users/new answers is taken as a ban', () => {
		// An IP ban and a Blackbox block, which refuses one attempt rather than the
		// address, arrive there in the same envelope. Nothing is lost by waiting
		// for `/sites/new`: the ban is on the address, and a run inside one meets
		// it there too, every time it makes a site.
		const users = 'https://public-api.wordpress.com/rest/v1.1/users/new';

		expect( detectThrottle( { error: 'throttled' } ) ).toBeNull();
		expect(
			detectThrottle( { url: users, status: 403, body: '{"error":"throttled"}' } )
		).toBeNull();
	} );

	test( 'an endpoint the payload does not name is taken from the caller', () => {
		// How the Node client records: it holds the URL, the body does not.
		expect(
			detectThrottle(
				{ error: 'throttled' },
				'https://public-api.wordpress.com/rest/v1.1/sites/new'
			)
		).toBe( 'signup' );
		expect(
			detectThrottle( new Error( 'throttled' ), 'https://x/rest/v1.1/users/new' )
		).toBeNull();
	} );

	// The bodies wpcom really answers these four endpoints with.
	test.each( [
		[
			{
				url: 'https://public-api.wordpress.com/rest/v1.1/sites/new',
				status: 403,
				body: '{"error":"throttled","message":"Limit reached. You can try again in 10 minutes. Trying again before that will only increase the time you have to wait before the ban is lifted."}',
			},
			'signup',
		],
		[
			{
				url: 'https://public-api.wordpress.com/rest/v1.1/domains/suggestions?query=x',
				status: 403,
				body: '{"error":"domain_suggestions_throttled","message":"Limit reached. You can try again in 1 minutes."}',
			},
			'domain-suggestions',
		],
		[
			{
				url: 'https://public-api.wordpress.com/rest/v1.3/domains/example.com/is-available?is_cart_pre_check=false',
				status: 429,
				body: '{"error":"domain_availability_throttle","message":"Limit reached."}',
			},
			'domain-availability',
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

	test( 'a page is never a ban, whatever it says', () => {
		// wpcom refuses these four in the JSON envelope `trap_wp_die` renders. What
		// `sendRequest` hands on as an unparseable page came from something else.
		expect(
			detectThrottle(
				new Error(
					'Failed to parse JSON: <!DOCTYPE html><html><body><h1>Limit reached.</h1>' +
						'<p>You can try again in 60 minutes.</p></body></html>'
				),
				'https://public-api.wordpress.com/rest/v1.1/sites/new'
			)
		).toBeNull();
	} );

	test( 'a page that merely reads "limit reached" is not a ban', () => {
		expect(
			detectThrottle( { url: '/sites/new', status: 503, body: '<h1>Limit reached</h1>' } )
		).toBeNull();
	} );

	test( 'the length wpcom states is not the length recorded', async () => {
		// The map is the source of truth: the sentence is translated, and only two
		// of the three endpoints put a number in it at all.
		await recordThrottle(
			{ error: 'throttled', message: 'Limit reached. You can try again in 60 minutes.' },
			'https://public-api.wordpress.com/rest/v1.1/sites/new'
		);

		expect( published() ).toEqual( [ expect.stringContaining( 'duration=600000' ) ] );
	} );

	test( 'recording returns the throttle it detected', async () => {
		await expect(
			recordThrottle(
				{ error: 'domain_suggestions_throttled' },
				'https://public-api.wordpress.com/rest/v1.1/domains/suggestions'
			)
		).resolves.toBe( 'domain-suggestions' );
		await expect( recordThrottle( { success: true } ) ).resolves.toBeNull();
	} );
} );
