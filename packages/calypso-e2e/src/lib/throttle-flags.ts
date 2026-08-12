import { fetchBuildLog, fetchBuildsByTag, tagOwnBuild } from './teamcity';
import type { TaggedBuild } from './teamcity';

export const THROTTLE_IDS = [ 'signup', 'domain-suggestions', 'domain-availability' ] as const;
export type ThrottleId = ( typeof THROTTLE_IDS )[ number ];

export interface ThrottleFlag {
	id: ThrottleId;
	raisedAtMs: number;
	durationMs: number;
	expiresAtMs: number;
}

export interface ThrottleDetection {
	id: ThrottleId;
	durationMs: number;
}

/**
 * Used when the response does not say how long the ban lasts. wpcom's own
 * message carries the number whenever it knows it, so these are the floor, not
 * the source of truth: `signup` bans for 60 minutes on the public tier and 10
 * on an a8c IP, and `is-available` never states a duration at all.
 */
const FALLBACK_DURATIONS: Record< ThrottleId, number > = {
	signup: 3_600_000,
	'domain-suggestions': 60_000,
	'domain-availability': 60_000,
};

/**
 * How far back a tag is worth reading. TeamCity filters on when a build
 * started, not on when it raised a flag, so this has to cover a long build plus
 * the longest ban we know of, or a build that has been running for hours and hit
 * a throttle a minute ago would not be listed at all.
 */
const TAG_WINDOW_MS = 6 * 60 * 60 * 1000;

/**
 * How long the whole read may spend pulling logs. A read already begun runs to
 * its own deadline, so the ceiling is this plus one `fetchBuildLog`, which has
 * to stay under the deadline the pre-flight check wraps the call in. Builds come
 * newest first, so what a spent budget drops is the oldest and least likely to
 * still be in force.
 *
 * Kept short because the check runs once per `playwright test` invocation, and a
 * build that runs the suite several times over — the Atomic variations do —
 * pays it every time, inside one execution timeout.
 */
const LOG_BUDGET_MS = 20_000;

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
 * Forgets what this worker has raised. For tests: a worker never needs this.
 */
export function resetRaisedThrottles(): void {
	raisedHere.clear();
	tagSettled.clear();
	tagAttempts.clear();
	tagging.clear();
	reportedHere.clear();
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
 * Renders a flag as the log line that carries what the tag cannot.
 *
 * The tag says only that a build hit this throttle; TeamCity stamps no time on
 * it and exposes build statistics only once a build has finished. This line is
 * in the build log the moment it is printed, so it is the one place a peer can
 * read the ban's length while the build that hit it is still running.
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
 * Reads the ban length wpcom states in its own throttle message.
 *
 * `security.php` renders "Limit reached. You can try again in %d minutes", so
 * the server is the authority on how long to stay away. Returns null when the
 * message carries no number, as `is-available` does, or one no ban would state:
 * every wpcom throttle is minutes or hours, and the number ends up in a `Date`.
 */
export function parseBanDurationMs( text: string ): number | null {
	const match = /try again in (\d+) minutes?/i.exec( text );
	const ms = match ? Number( match[ 1 ] ) * 60_000 : 0;
	return ms > 0 && ms <= 24 * 60 * 60_000 ? ms : null;
}

/**
 * Records a throttle this worker just hit: tags the build and prints the line.
 *
 * Both happen at once, because both are readable at once — a tag POST is in the
 * database when it returns, and a log line is queryable a second later. A line
 * is printed for the first ban of an id and again only if a later response
 * states a longer one, since the line is all a peer gets. The tag is retried
 * until it lands or is refused often enough to be settled: an untagged build
 * leaves its line where no peer can find it. Never throws: a build that cannot
 * be tagged still runs, and still knows about the ban itself.
 */
export async function raiseFlag( id: ThrottleId, durationMs?: number ): Promise< void > {
	const nowMs = Date.now();
	const duration = durationMs && durationMs > 0 ? durationMs : FALLBACK_DURATIONS[ id ];
	const expiresAtMs = nowMs + duration;

	const known = raisedHere.get( id );
	const live = known && known.expiresAtMs > nowMs ? known : null;

	// Lengths, not expiries: the same ban hit again a second later would compute
	// a later expiry, and republishing it would show a peer the ban restarting.
	// The first refusal often states no length and falls back to the floor, and a
	// later one can state the real ban, which is the number worth publishing.
	if ( ! live || duration > live.durationMs ) {
		const flag: ThrottleFlag = { id, raisedAtMs: nowMs, durationMs: duration, expiresAtMs };
		raisedHere.set( id, flag );
		console.warn( formatThrottleLine( flag ) );
	} else if ( expiresAtMs > live.expiresAtMs ) {
		// Refused again while the ban is still in force: wpcom's own message says
		// coming back early lengthens it, so the expiry moves out. The line does
		// not, for the reason above.
		raisedHere.set( id, { ...live, expiresAtMs } );
	}

	if ( tagSettled.has( id ) ) {
		return;
	}

	// A burst of refusals is one opportunity to tag, not several: the page fires
	// a request per keystroke, and three of them landing in the same tick would
	// otherwise spend every attempt on one instant of TeamCity trouble.
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
 * Records a throttle if this response or error signals one. Never throws.
 */
export async function recordThrottle( responseOrError: unknown ): Promise< void > {
	const throttle = detectThrottle( responseOrError );
	if ( throttle ) {
		await raiseFlag( throttle.id, throttle.durationMs );
	}
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
 * Reporting only: the call goes ahead. What a build does about a known throttle
 * — skip, fail, wait — is a later decision, and until it is taken the log is
 * where it shows. The line is deliberately not one `EVERY_LINE` matches, so a
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
 * A finished build whose log carries no line counts as throttled for the
 * documented length from when it finished — the latest moment it could have
 * raised the flag. A running build with no line yields nothing: it could have
 * raised the flag at any point, so assuming "from now" would republish the same
 * ban, always an hour fresh, for as long as that build runs. A build whose log
 * we did not read yields nothing either, and says so. Nothing is retried, and an
 * id that cannot be looked up at all is reported and skipped rather than taking
 * the other two down with it.
 */
export async function readActiveThrottles(
	nowMs: number = Date.now()
): Promise< Record< ThrottleId, number | null > > {
	// The tag lookups are small and independent, and they run before the clock
	// below starts: a slow one would otherwise spend the budget the log reads
	// need, and the ids at the end of the list would read nothing.
	const listed = await Promise.all(
		THROTTLE_IDS.map( async ( id ) => {
			try {
				const sinceMs = nowMs - TAG_WINDOW_MS;
				return { id, builds: await fetchBuildsByTag( throttleTag( id ), { sinceMs } ) };
			} catch ( error ) {
				console.warn( `Could not read what other builds hit for ${ id }: ${ error }` );
				return { id, builds: null };
			}
		} )
	);

	// A build that hit two throttles carries both tags. Read each log once,
	// however many ids ask for it, and keep only the lines: a build log runs to
	// tens of megabytes and the read is charged to a test timeout. One at a time,
	// so only one of them is ever in this worker's heap.
	//
	// Null is "we did not read it", which is not the same as reading it and
	// finding nothing: the caller still has the tag, and the tag is what the
	// fallback rests on.
	//
	// One clock for the whole read, not a share each: the loop below is
	// sequential, so a per-id share would stop the first id short while the ids
	// after it, which may have no tagged build at all, keep time they cannot
	// spend. The ids that come first are the ones with the longest bans.
	const until = Date.now() + LOG_BUDGET_MS;
	const flags = new Map< number, Promise< Map< ThrottleId, ThrottleFlag > | null > >();
	const unread = Promise.resolve( null );
	const skipped = new Set< number >();
	const readFlags = ( buildId: number ) => {
		const known = flags.get( buildId );
		if ( known ) {
			return known;
		}
		if ( Date.now() >= until ) {
			skipped.add( buildId );
			return unread;
		}
		const reading = fetchBuildLog( buildId )
			.then( flagsInLog )
			.catch( ( error ) => {
				console.warn( `Could not read the log of build ${ buildId }: ${ error }` );
				return null;
			} );
		flags.set( buildId, reading );
		return reading;
	};

	const active = {} as Record< ThrottleId, number | null >;
	for ( const { id, builds } of listed ) {
		active[ id ] = await furthestExpiry( id, nowMs, builds, readFlags );
	}

	// Said out loud: an id whose builds all went unread reads exactly like an id
	// with nothing to report, and a reader has no other way to tell them apart.
	const dropped = skipped.size;
	if ( dropped ) {
		console.warn(
			`Ran out of time to read ${ dropped } tagged build log(s). What they carry is not in this report.`
		);
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
		// A log we did not read leaves the tag, which is proof the ban happened,
		// and the finish date, which bounds when: exactly what a build whose log we
		// did read and found nothing in leaves. Not reading is less information, so
		// it cannot yield a weaker answer than reading.
		const flag = ( await readFlags( build.id ) )?.get( id );
		const assumed = build.finishedAtMs === null ? 0 : build.finishedAtMs + FALLBACK_DURATIONS[ id ];
		latest = Math.max( latest, flag ? flag.expiresAtMs : assumed );
	}
	return latest > nowMs ? latest : null;
}

/**
 * The longest-lived flag of each id in a build log. A build's workers each print
 * their own line, so there is rarely only one. The single reader of the line
 * format: a log, a fragment of one, or a single line all go through here.
 */
export function flagsInLog( log: string | null ): Map< ThrottleId, ThrottleFlag > {
	const latest = new Map< ThrottleId, ThrottleFlag >();
	// Scanned rather than split into lines: a build log runs to tens of megabytes
	// and holding an array of every one of them costs as much again.
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
 * Maps a response or error to the throttle it signals, with the ban length the
 * server stated where it stated one.
 */
export function detectThrottle( responseOrError: unknown ): ThrottleDetection | null {
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

	const id = detectThrottleId( text );
	if ( ! id ) {
		return null;
	}
	return { id, durationMs: parseBanDurationMs( text ) ?? FALLBACK_DURATIONS[ id ] };
}

/**
 * The error codes wpcom returns for each throttled endpoint.
 *
 * `/sites/new` and `/users/new` wrap their throttle check in
 * `trap_wp_die( 'throttled' )`; `/domains/suggestions` and `.../is-available`
 * name themselves.
 *
 * The endpoint is read before the generic code, not after: a domain endpoint
 * can answer with the bare `throttled` too, and mapping that to signup would
 * record an hour-long ban on the one endpoint that is not banned.
 */
function detectThrottleId( text: string ): ThrottleId | null {
	if ( /domain_availability_throttle/i.test( text ) ) {
		return 'domain-availability';
	}
	if ( /domain_suggestions_throttled/i.test( text ) ) {
		return 'domain-suggestions';
	}

	// wpcom refuses in one of two voices: the `throttled` code in a JSON answer,
	// or the sentence `security.php` renders, which always says when to come back
	// and reaches us as a page whenever `wp_die` drew it. A gateway page is a
	// third voice, and the word alone in one of those is that gateway talking
	// about its own upstream, not a ban on us.
	const page = /<!doctype|<html/i.test( text );
	const throttled = ! page && /(?:^|[^a-z0-9_])throttled(?:$|[^a-z0-9_])/i.test( text );
	if ( ! throttled && ! /limit reached/i.test( text ) ) {
		return null;
	}

	if ( /is-available/i.test( text ) ) {
		return 'domain-availability';
	}
	if ( /domains\/suggestions/i.test( text ) ) {
		return 'domain-suggestions';
	}
	// Nothing names the endpoint, so signup has to be carried by wpcom's own
	// voice: the code, or the message that always says when to come back.
	return throttled || /try again/i.test( text ) ? 'signup' : null;
}
