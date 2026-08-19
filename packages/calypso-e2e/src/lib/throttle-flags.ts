import { appendOwnBuildLog, fetchBuildLog, fetchBuildsByTag, tagOwnBuild } from './teamcity';
import { withDeadline } from './with-deadline';
import type { TaggedBuild } from './teamcity';

export const THROTTLE_IDS = [ 'signup', 'domain-suggestions', 'domain-availability' ] as const;
export type ThrottleId = ( typeof THROTTLE_IDS )[ number ];
export type ThrottleAction = 'skip' | 'fail';

export const THROTTLE_ACTION_ENV_VARS = {
	signup: 'E2E_THROTTLE_SIGNUP_ACTION',
	'domain-suggestions': 'E2E_THROTTLE_DOMAIN_SUGGESTIONS_ACTION',
	'domain-availability': 'E2E_THROTTLE_DOMAIN_AVAILABILITY_ACTION',
} as const satisfies Record< ThrottleId, string >;

export type ThrottleActionHandler = ( action: ThrottleAction, ids: readonly ThrottleId[] ) => void;

let actionHandler: ThrottleActionHandler | null = null;

export interface ThrottleFlag {
	id: ThrottleId;
	raisedAtMs: number;
	durationMs: number;
	expiresAtMs: number;
}

/**
 * Where each throttle is answered. One list, so the browser watcher filters on
 * what detection maps and an endpoint added here reaches both rather than being
 * read by one and dropped by the other.
 *
 * `/users/new` is deliberately absent: nothing said there can be classified, so
 * there is no reason to read a body that carries a new user's credentials.
 *
 * The tail matches a path in a URL and a path in a payload that has been through
 * `JSON.stringify` alike, and keeps `/sites/newsletter` from reading as a signup.
 */
const THROTTLED_PATHS: Record< ThrottleId, RegExp > = {
	signup: /sites\/new(?:[/?"\s]|$)/i,
	'domain-suggestions': /domains\/suggestions(?:[/?"\s]|$)/i,
	'domain-availability': /[^/]+\/is-available(?:[/?"\s]|$)/i,
};

/**
 * Whether a URL is one of the endpoints a throttle is ever answered on. For
 * callers that decide whether a response is worth reading at all.
 */
export function mayBeThrottled( url: string ): boolean {
	return Object.values( THROTTLED_PATHS ).some( ( path ) => path.test( url ) );
}

/**
 * How long each ban lasts. A refusal cannot be asked: it names a length only
 * sometimes, in a translated sentence. These are the windows the limiters
 * themselves apply to a request from an Automattic IP, which is where CI runs,
 * not lengths guessed from what a refusal looked like.
 */
const BAN_DURATIONS: Record< ThrottleId, number > = {
	signup: 600_000,
	'domain-suggestions': 60_000,
	'domain-availability': 3_600_000,
};

/**
 * How far back a tag is worth reading. TeamCity filters on when a build
 * started, not on when it raised a flag, so this has to cover a long build plus
 * the longest ban we know of, or a build that has been running for hours and hit
 * a throttle a minute ago would not be listed at all.
 */
const TAG_WINDOW_MS = 6 * 60 * 60 * 1000;

/**
 * How long the whole read may spend pulling logs. An E2E build's log measures a
 * little over 100KB and takes about a second to pull, and the locator asks for
 * at most twenty builds, so this covers most of a worst case that in practice
 * never arrives: a project with no throttle at all has no build to read.
 */
const LOG_BUDGET_MS = 20_000;

/**
 * The writes still in flight. A worker does not wait for its own: it knows
 * about the ban already, and the request is only there to tell everyone else.
 * Something has to hold them, though, or a worker exits mid-request and the
 * last throttle of a run is never published.
 */
const publishing = new Set< Promise< void > >();

/**
 * Settles what `raiseFlag` started. For a worker's teardown, which is the last
 * moment a build can still say what it hit.
 */
export async function flushThrottleWrites(): Promise< void > {
	while ( publishing.size ) {
		await Promise.allSettled( [ ...publishing ] );
	}
}

/**
 * What this worker has already raised. One entry per id: a worker that has seen
 * a throttle knows about it for as long as it lasts, whatever happens next.
 */
const raisedHere = new Map< ThrottleId, ThrottleFlag >();

/**
 * The ids there is nothing left to do about: the tag landed, there is no build
 * to tag, or TeamCity has refused often enough to call it settled. Separate from
 * the flag, because what the worker knows about a ban does not depend on
 * TeamCity having accepted anything.
 */
const tagSettled = new Set< ThrottleId >();

/**
 * How many times a tag is worth trying. A refusal is usually a permission, not
 * a blip, and every retry is a request a test's teardown waits on.
 *
 * Per worker, which is as far as a count in a module can reach: a build running
 * a worker per core spends this many attempts in each of them. Bounded either
 * way, and the tag only has to land once for the build to be findable.
 */
const TAG_ATTEMPTS = 3;
const tagAttempts = new Map< ThrottleId, number >();

/**
 * The tag request in flight per id, so callers that arrive together share one.
 */
const tagging = new Map< ThrottleId, Promise< void > >();

/**
 * What has been reported to the log, by expiry, so a worker states a ban once
 * rather than before every call that might run into it.
 */
const reportedHere = new Map< ThrottleId, number >();

/**
 * Forgets what this worker has raised and whatever handler was installed. For
 * tests: a worker never needs this. A case that throws mid-policy would
 * otherwise leave its handler registered for the rest of the file.
 */
export function resetThrottleState(): void {
	actionHandler = null;
	raisedHere.clear();
	tagSettled.clear();
	tagAttempts.clear();
	tagging.clear();
	reportedHere.clear();
	publishing.clear();
}

/**
 * Installs the runner-specific operation used to skip or fail the current test.
 */
export function registerThrottleActionHandler( handler: ThrottleActionHandler ): () => void {
	actionHandler = handler;
	return () => {
		if ( actionHandler === handler ) {
			actionHandler = null;
		}
	};
}

/**
 * The configured action for an active throttle. An unset value defaults to skip.
 */
export function throttleAction( id: ThrottleId ): ThrottleAction {
	const variable = THROTTLE_ACTION_ENV_VARS[ id ];
	const value = process.env[ variable ];
	if ( ! value ) {
		return 'skip';
	}
	if ( value === 'skip' || value === 'fail' ) {
		return value;
	}
	throw new Error( `Invalid ${ variable } value: ${ value }. Expected skip or fail.` );
}

/**
 * Validates every action at startup, before Playwright starts collecting tests.
 */
export function validateThrottleActions(): void {
	THROTTLE_IDS.forEach( throttleAction );
}

/**
 * The build tag for a throttle. Generic by design: a tag is written and read
 * back instantly, and keeping the vocabulary to one string per id means a
 * reader can find every affected build with a single `tag:` locator.
 */
export function throttleTag( id: ThrottleId ): string {
	return `throttle-${ id }`;
}

/**
 * The variable the pre-flight check writes and workers read.
 */
export function throttleEnvVar( id: ThrottleId ): string {
	return `THROTTLE_${ id.toUpperCase().replace( /-/g, '_' ) }_EXPIRATION`;
}

const EVERY_LINE = /\[e2e-throttle] type=([a-z-]+) start=(\d+) duration=(\d+) end=(\d+)/g;

/**
 * An instant a `Date` can hold. A log line TeamCity truncated or interleaved can
 * leave digits that parse to a number no date accepts, and every reader of an
 * expiry ends up calling `toISOString()` on it.
 */
function expiryOrNull( value: string | undefined ): number | null {
	const ms = Number( value );
	return Number.isFinite( ms ) && Math.abs( ms ) <= 8.64e15 ? ms : null;
}

/**
 * Renders a flag as the line that carries what the tag cannot.
 *
 * The tag says only that a build hit this throttle; TeamCity stamps no time on
 * it and exposes build statistics only once a build has finished. A build's
 * comment is readable the moment the request setting it returns, so it is the
 * one place a peer can read the ban's length while the build that hit it is
 * still running.
 */
export function formatThrottleLine( flag: ThrottleFlag ): string {
	return `[e2e-throttle] type=${ flag.id } start=${ flag.raisedAtMs } duration=${ flag.durationMs } end=${ flag.expiresAtMs }`;
}

/**
 * The flag a matched line describes, or null when it describes nothing usable.
 */
function flagFromMatch( match: RegExpMatchArray ): ThrottleFlag | null {
	const id = match[ 1 ] as ThrottleId;
	const expiresAtMs = expiryOrNull( match[ 4 ] );
	if ( ! THROTTLE_IDS.includes( id ) || expiresAtMs === null ) {
		return null;
	}
	return {
		id,
		raisedAtMs: Number( match[ 2 ] ),
		durationMs: Number( match[ 3 ] ),
		expiresAtMs,
	};
}

/**
 * Tells everyone else about a ban this worker hit: writes the line, then tags.
 *
 * That order, and the tag only if the line landed. A tag is what makes a build
 * findable and a tag with no line to read counts for nothing, so tagging first
 * publishes a build a peer can find and learn nothing from. A line that did not
 * land leaves the build untagged, and the next refusal — which a throttled
 * endpoint will supply — tries the whole thing again.
 *
 * Nothing waits on this. The worker that hit the throttle already knows.
 */
async function publish( flag: ThrottleFlag ): Promise< void > {
	try {
		const status = await appendOwnBuildLog( formatThrottleLine( flag ) );
		// No build to write on is a local run: nothing to tag either.
		if ( status === null ) {
			return;
		}
		if ( status < 200 || status >= 300 ) {
			console.warn( `TeamCity refused the ${ flag.id } throttle line with status ${ status }.` );
			return;
		}
	} catch {
		// Telling everyone else never fails the test that found it.
		return;
	}

	const id = flag.id;
	if ( tagSettled.has( id ) ) {
		return;
	}

	// A burst of refusals is one opportunity to tag, not several: the page fires
	// a request per keystroke, and three of them landing together would otherwise
	// spend every attempt on one instant of TeamCity trouble.
	const inFlight = tagging.get( id );
	if ( inFlight ) {
		await inFlight;
		return;
	}

	const attempt = tagOnce( id );
	tagging.set( id, attempt );
	try {
		await attempt;
	} finally {
		tagging.delete( id );
	}
}

/**
 * Records a throttle this worker just hit.
 *
 * The worker's own copy is set first and unconditionally: it ran into the ban,
 * so it knows about it whatever TeamCity has to say, and it must not have to
 * wait on a request to act on what it already saw. Both the map and the
 * variable, so a caller reads a ban this worker raised the same way it reads
 * one the pre-flight check found.
 *
 * Telling everyone else runs behind that and is not awaited here. It is held in
 * `publishing` so a worker's teardown can settle it; see `flushThrottleWrites`.
 * Never throws.
 */
export function raiseFlag( id: ThrottleId ): Promise< void > {
	const nowMs = Date.now();
	const duration = BAN_DURATIONS[ id ];
	const expiresAtMs = nowMs + duration;

	const known = raisedHere.get( id );
	const live = known && known.expiresAtMs > nowMs ? known : null;

	// Refused again while the ban is in force: coming back early lengthens it, so
	// the expiry moves out. Restated to everyone else as the ban ages rather than
	// on every refusal: the endpoints that answer one refusal per keystroke would
	// otherwise spend a request each, so a peer's copy of the expiry is at most a
	// tenth of a ban behind this worker's.
	const restating = ! live || nowMs - live.raisedAtMs >= duration / 10;
	const flag: ThrottleFlag = restating
		? { id, raisedAtMs: nowMs, durationMs: duration, expiresAtMs }
		: { ...( live as ThrottleFlag ), expiresAtMs };

	raisedHere.set( id, flag );
	process.env[ throttleEnvVar( id ) ] = String( expiresAtMs );

	if ( ! restating ) {
		return Promise.resolve();
	}

	// Not a line `EVERY_LINE` matches: what a peer reads is written to the build
	// log through the REST API, and this is only so a person reading it knows why.
	console.warn( `wpcom is throttling ${ id } for ${ approximately( duration ) }.` );

	const writing = publish( flag ).finally( () => publishing.delete( writing ) );
	publishing.add( writing );
	return writing;
}

/**
 * Tags the build, trying again while it is worth trying.
 *
 * The tries happen here rather than waiting for the next detection: a worker
 * that hits a throttle once and then runs specs that never touch it again would
 * otherwise leave its line in a build no `tag:` locator can find.
 */
async function tagOnce( id: ThrottleId ): Promise< void > {
	// Twice here, three times in the build's life: an immediate retry covers the
	// blip, and what is left covers the next detection, which is a different
	// moment of TeamCity's day rather than the same one asked again.
	for ( let tries = 0; tries < 2 && ( tagAttempts.get( id ) ?? 0 ) < TAG_ATTEMPTS; tries++ ) {
		tagAttempts.set( id, ( tagAttempts.get( id ) ?? 0 ) + 1 );

		try {
			const status = await tagOwnBuild( throttleTag( id ) );
			// A refusal is otherwise indistinguishable from a tagged build: the
			// status is all we may print, never the error, which can carry a header
			// derived from the build token. A local run has no build to tag, and
			// nothing to retry either.
			if ( status === null || ( status >= 200 && status < 300 ) ) {
				tagSettled.add( id );
				return;
			}
			console.warn( `TeamCity refused the ${ id } throttle tag with status ${ status }.` );
		} catch {
			// Recording a throttle never fails the test that found it.
		}
	}

	if ( ( tagAttempts.get( id ) ?? 0 ) >= TAG_ATTEMPTS ) {
		tagSettled.add( id );
	}
}

/**
 * Records a throttle if this response or error signals one, and returns its id.
 * Never throws and never waits for the build publication it starts.
 *
 * The endpoint is given separately by callers whose payload does not carry it:
 * what a bare `throttled` code means depends on which endpoint answered with it.
 */
export async function recordThrottle(
	responseOrError: unknown,
	url?: string
): Promise< ThrottleId | null > {
	const id = detectThrottle( responseOrError, url );
	if ( id ) {
		void raiseFlag( id );
	}
	return id;
}

/**
 * How long a body has to arrive. `waitForResponse` and the context listener both
 * hand over a response whose headers are in and whose body may still be in
 * flight, and Playwright puts no timeout on reading one: an unbounded read holds
 * the caller until the test times out. A body that slow says nothing about a ban.
 */
const BODY_TIMEOUT = 2 * 1000;

/**
 * A response as detection reads it.
 */
export interface ThrottleResponse {
	url(): string;
	status(): number;
	text(): Promise< string >;
}

/**
 * Records a throttle from a response, and returns its id.
 *
 * A plain success is never handed to detection: an enveloped success carries no
 * error key, and a domain search result can hold anything a caller typed —
 * including our own tokens.
 */
export async function recordResponseThrottle(
	response: ThrottleResponse
): Promise< ThrottleId | null > {
	const status = response.status();
	const body = await withDeadline( response.text(), BODY_TIMEOUT ).catch( () => '' );
	if ( status < 400 && ! /"error"\s*:/.test( body ) ) {
		return null;
	}
	return recordThrottle( { url: response.url(), status, body } );
}

/**
 * The throttle in force and what is known about it, or null when there is none.
 *
 * Two sources, nearest first: what this worker has hit itself, then what the
 * pre-flight check found on other builds before the run started. Neither sees a
 * ban another worker in this build hit after the run began — by design, that
 * worker finds it the same way, by hitting it.
 *
 * A throttle this worker raised carries its length; one published by the
 * pre-flight check carries only an expiry, since that is all a build tag and a
 * peer's log line can be reduced to.
 */
function activeThrottle(
	id: ThrottleId,
	nowMs: number
): { expiresAtMs: number; durationMs?: number } | null {
	const raised = raisedHere.get( id );
	if ( raised && raised.expiresAtMs > nowMs ) {
		return raised;
	}

	const expiresAtMs = expiryOrNull( process.env[ throttleEnvVar( id ) ] || undefined );
	return expiresAtMs !== null && expiresAtMs > nowMs ? { expiresAtMs } : null;
}

/**
 * Applies the configured policy when any of the given throttles is in force.
 * A failing policy wins when a group contains both actions.
 *
 * No handler means no test to skip or fail: the fixture that registers one runs
 * per test, and Playwright leaves it out of `beforeAll` and `afterAll`. A ban met
 * there is stated in the log and nothing more, so the tests that go on to touch
 * the banned endpoint each take the policy for themselves rather than the whole
 * describe block taking it for tests that never reach one.
 */
export function handleActiveThrottles(
	ids: Iterable< ThrottleId >,
	nowMs: number = Date.now()
): void {
	const active = [ ...new Set( ids ) ].filter( ( id ) => activeThrottle( id, nowMs ) );
	if ( ! active.length ) {
		return;
	}

	// Once per worker per ban, and the only place a build states how long it has
	// left: the tag and the line say what a peer reads, not what this log shows.
	active.forEach( ( id ) => debugThrottle( id, nowMs ) );

	const action = active.some( ( id ) => throttleAction( id ) === 'fail' ) ? 'fail' : 'skip';
	const selected = active.filter( ( id ) => throttleAction( id ) === action );
	// Optional: a `beforeAll` has no handler, and skipping there would take down
	// every test in the block, including the ones that never reach the endpoint.
	actionHandler?.( action, selected );
}

/**
 * How much of a test's outcome the policy needs to know about. Playwright's
 * `TestInfo` satisfies it; the fields are named here so the decision can be
 * tested without a runner.
 */
export interface ThrottleTestState {
	errors: readonly unknown[];
	status?: string;
	expectedStatus?: string;
}

/**
 * What the policy has to say to a test in this state, or null when it has
 * nothing to say to it.
 *
 * A test that already failed or skipped for a reason of its own keeps it: the
 * handler runs from fixture teardown too, so it meets tests that stopped on
 * their own account, and stating a ban there would append a skip reason the test
 * never earned, or turn its skip into a failure outright. The runner's own state
 * rather than a flag set by the handler: Playwright marks `expectedStatus`
 * before `skip` throws, so a caller that swallows the throw cannot silence the
 * policy for the rest of the test.
 */
export function throttleActionMessage(
	action: ThrottleAction,
	ids: readonly ThrottleId[],
	state: ThrottleTestState
): string | null {
	if ( state.errors.length || state.status === 'skipped' || state.expectedStatus === 'skipped' ) {
		return null;
	}
	const message = `WordPress.com throttle active: ${ ids.join( ', ' ) }.`;
	return action === 'skip' ? message : `${ message } E2E throttle action is fail.`;
}

/**
 * Rounds a span to whatever unit reads plainly in a log line.
 */
function approximately( ms: number ): string {
	if ( ms >= 60_000 ) {
		const minutes = Math.round( ms / 60_000 );
		return `~${ minutes } minute${ minutes === 1 ? '' : 's' }`;
	}
	const seconds = Math.max( 1, Math.round( ms / 1_000 ) );
	return `~${ seconds } second${ seconds === 1 ? '' : 's' }`;
}

/**
 * Reports that a call is about to run into a throttle we already know about.
 *
 * Reporting only: `handleActiveThrottles` calls this before it decides what to
 * do about the ban. The line is deliberately not one `EVERY_LINE` matches, so a
 * build cannot re-report a peer's ban as its own.
 *
 * Said once per worker per ban: a build runs hundreds of specs, and the line
 * that matters is the first one, not the same sentence between every two.
 */
export function debugThrottle( id: ThrottleId, nowMs: number = Date.now() ): void {
	const active = activeThrottle( id, nowMs );
	if ( ! active || reportedHere.get( id ) === active.expiresAtMs ) {
		return;
	}
	reportedHere.set( id, active.expiresAtMs );

	const duration =
		active.durationMs === undefined
			? 'unknown duration'
			: `${ active.durationMs }ms (${ approximately( active.durationMs ) })`;

	console.warn(
		`[e2e-throttle-debug] ${ id } is throttled: ${ duration }, ` +
			`${ approximately( active.expiresAtMs - nowMs ) } left, until ${ new Date(
				active.expiresAtMs
			).toISOString() }.`
	);
}

/**
 * The latest expiry each throttle carries across the project's recent builds.
 *
 * Three answers per id, not two: a number is a ban that reaches that far, null is
 * a look that found none, and a missing key is a look that could not be taken.
 * The last covers the lookup itself being refused — an id nothing can be said
 * about is not an id with nothing to report, and nothing is retried.
 *
 * A tag alone reports nothing. Only a build whose log carries a line for this id
 * that is still in force counts; a tagged build with no such line, or one whose
 * log there was no time to read, is passed over rather than dated from its own
 * clock. What that costs is a ban going unreported until somebody runs into it,
 * which is how every ban here is found in the first place; what it buys is that
 * no expiry is ever published that no build ever wrote.
 */
export async function readActiveThrottles(
	nowMs: number = Date.now()
): Promise< Partial< Record< ThrottleId, number | null > > > {
	// One lookup per id, together: each carries back the builds that hit it and
	// what those builds state, so this is the only round trip the check makes.
	const listed = await Promise.all(
		THROTTLE_IDS.map( async ( id ) => {
			try {
				const sinceMs = nowMs - TAG_WINDOW_MS;
				return {
					id,
					builds: await fetchBuildsByTag( throttleTag( id ), { sinceMs } ),
					looked: true,
				};
			} catch ( error ) {
				console.warn( `Could not read what other builds hit for ${ id }: ${ error }` );
				return { id, builds: null, looked: false };
			}
		} )
	);

	// A build that hit two throttles carries both tags. Read each log once,
	// however many ids ask for it. One clock for the whole read rather than a
	// share each: the loop below is sequential, so a per-id share would stop the
	// first id short while the ids after it, which may have no tagged build at
	// all, keep time they cannot spend.
	const until = Date.now() + LOG_BUDGET_MS;
	const logs = new Map< number, Promise< Map< ThrottleId, ThrottleFlag > | null > >();
	const unread = Promise.resolve( null );
	const readFlags = ( buildId: number ) => {
		const known = logs.get( buildId );
		if ( known ) {
			return known;
		}
		if ( Date.now() >= until ) {
			return unread;
		}
		const reading = fetchBuildLog( buildId )
			.then( flagsInLog )
			.catch( ( error: unknown ) => {
				console.warn( `Could not read the log of build ${ buildId }: ${ error }` );
				return null;
			} );
		logs.set( buildId, reading );
		return reading;
	};

	const active: Partial< Record< ThrottleId, number | null > > = {};
	for ( const { id, builds, looked } of listed ) {
		if ( looked ) {
			active[ id ] = await furthestExpiry( id, nowMs, builds, readFlags );
		}
	}
	return active;
}

/**
 * The furthest expiry one throttle carries across the builds tagged with it.
 */
async function furthestExpiry(
	id: ThrottleId,
	nowMs: number,
	builds: TaggedBuild[] | null,
	readFlags: ( buildId: number ) => Promise< Map< ThrottleId, ThrottleFlag > | null >
): Promise< number | null > {
	let latest = 0;
	for ( const build of builds ?? [] ) {
		// A tagged build with no line for this id is passed over, whether the log
		// said nothing or went unread. The tag says a ban happened; only the line
		// says when it ends, and dating one from the build's own clock would
		// publish an expiry no build ever wrote. A lapsed line goes the same way,
		// being no further off than none at all.
		const flag = ( await readFlags( build.id ) )?.get( id );
		latest = Math.max( latest, flag?.expiresAtMs ?? 0 );
	}

	return latest > nowMs ? latest : null;
}

/**
 * The longest-lived flag of each id in a piece of text. The single reader of the
 * line format: a build's comment, a fragment of one, or a single line all go
 * through here.
 */
export function flagsInLog( log: string | null ): Map< ThrottleId, ThrottleFlag > {
	const latest = new Map< ThrottleId, ThrottleFlag >();
	for ( const match of ( log ?? '' ).matchAll( EVERY_LINE ) ) {
		const flag = flagFromMatch( match );
		const known = flag && latest.get( flag.id );
		if ( flag && ( ! known || flag.expiresAtMs > known.expiresAtMs ) ) {
			latest.set( flag.id, flag );
		}
	}
	return latest;
}

/**
 * The throttle a response or error signals, or null for one that signals none.
 * How long it lasts is `BAN_DURATIONS`, not anything read here. `url` is folded
 * into what is matched, for callers holding an endpoint their payload does not
 * name.
 */
export function detectThrottle( responseOrError: unknown, url?: string ): ThrottleId | null {
	let text: string;
	try {
		if ( responseOrError instanceof Error ) {
			text = `${ responseOrError.name } ${ responseOrError.message } ${
				( responseOrError as Error & { code?: unknown } ).code || ''
			}`;
		} else {
			text =
				typeof responseOrError === 'string' ? responseOrError : JSON.stringify( responseOrError );
		}
	} catch {
		return null;
	}

	return detectThrottleId( url ? `${ url } ${ text }` : text );
}

/**
 * The endpoint and the error code, and nothing else.
 *
 * Never the message: wpcom translates it into the locale the caller asked for,
 * so matching on it works in English and quietly stops working everywhere else.
 * Codes and paths are the same in every language.
 *
 * `/sites/new` and `/users/new` wrap their throttle check in
 * `trap_wp_die( 'throttled' )`; `/domains/suggestions` and `.../is-available`
 * name themselves. The named codes are read first: a domain endpoint can answer
 * with the bare `throttled` too, and reading that as signup would record the
 * longest ban we know of against an endpoint that is not banned.
 */
function detectThrottleId( text: string ): ThrottleId | null {
	if ( /domain_availability_throttle/i.test( text ) ) {
		return 'domain-availability';
	}
	if ( /domain_suggestions_throttled/i.test( text ) ) {
		return 'domain-suggestions';
	}

	// The code as the envelope carries it, `"error":"throttled"`, escaped or not
	// depending on how many times the answer has been through `JSON.stringify`.
	// The bare word is something anything between us and wpcom can say about its
	// own upstream, in a page or in a line of plain text, and a gateway having a
	// bad minute is not a ban on this address.
	if ( ! /\\?"error\\?"\s*:\s*\\?"throttled\\?"/i.test( text ) ) {
		return null;
	}

	if ( THROTTLED_PATHS[ 'domain-availability' ].test( text ) ) {
		return 'domain-availability';
	}
	if ( THROTTLED_PATHS[ 'domain-suggestions' ].test( text ) ) {
		return 'domain-suggestions';
	}
	// `/users/new` answers in this same code, but never for a ban: the signup
	// throttle exempts the addresses our tests sign up with, so what is left there
	// is a Blackbox block, which refuses one attempt rather than banning anything.
	// `/sites/new` gets no such exemption, so the code settles it there.
	return THROTTLED_PATHS.signup.test( text ) ? 'signup' : null;
}
