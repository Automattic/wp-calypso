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

/**
 * How long each ban lasts. The answer is not asked how long it lasts: it says so
 * only sometimes, in a translated sentence, and these are the numbers wpcom
 * enforces from an Automattic IP, which is where CI runs. `signup` bans for 10
 * minutes there; `domain-suggestions` for one; `is-available` states nothing at
 * all and its limiter counts over a sliding hour.
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
 * Records a throttle this worker just hit: tags the build and prints the line.
 *
 * Both happen at once, because both are readable at once — a tag POST is in the
 * database when it returns, and a log line is queryable a second later. The tag
 * is retried until it lands or is refused often enough to be settled: an untagged
 * build leaves its line where no peer can find it. Never throws: a build that
 * cannot be tagged still runs, and still knows about the ban itself.
 */
export async function raiseFlag( id: ThrottleId ): Promise< void > {
	const nowMs = Date.now();
	const duration = BAN_DURATIONS[ id ];
	const expiresAtMs = nowMs + duration;

	const known = raisedHere.get( id );
	const live = known && known.expiresAtMs > nowMs ? known : null;

	// Refused again while the ban is in force: coming back early lengthens it, so
	// the expiry moves out, and the line is the only place a peer can read that.
	// Restated as the ban ages rather than on every refusal: the endpoints that
	// answer one refusal per keystroke would otherwise print a line each, so a
	// peer's copy of the expiry is at most a tenth of a ban behind this worker's.
	if ( live && nowMs - live.raisedAtMs < duration / 10 ) {
		raisedHere.set( id, { ...live, expiresAtMs } );
	} else {
		const flag: ThrottleFlag = { id, raisedAtMs: nowMs, durationMs: duration, expiresAtMs };
		raisedHere.set( id, flag );
		console.warn( formatThrottleLine( flag ) );
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
 *
 * The endpoint is given separately by callers whose payload does not carry it:
 * what a bare `throttled` code means depends on which endpoint answered with it.
 */
export async function recordThrottle( responseOrError: unknown, url?: string ): Promise< void > {
	const id = detectThrottle( responseOrError, url );
	if ( id ) {
		await raiseFlag( id );
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
	// spend. Which makes the order the budget is spent in matter, so it is taken
	// from the ban lengths rather than from however `THROTTLE_IDS` is written: an
	// id still in force hours from now has more to lose from running out of time
	// than one whose ban is a minute old and already over. A running build leaves
	// no finish date to fall back on either, so for that id an unread log is the
	// whole answer.
	listed.sort( ( a, b ) => BAN_DURATIONS[ b.id ] - BAN_DURATIONS[ a.id ] );

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
		const assumed = build.finishedAtMs === null ? 0 : build.finishedAtMs + BAN_DURATIONS[ id ];
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

	// A gateway page carrying the word is that gateway talking about its own
	// upstream, not wpcom refusing us. wpcom's own refusal is the JSON envelope
	// `trap_wp_die` renders, never a page.
	const page = /<!doctype|<html/i.test( text );
	if ( page || ! /(?:^|[^a-z0-9_])throttled(?:$|[^a-z0-9_])/i.test( text ) ) {
		return null;
	}

	if ( /is-available/i.test( text ) ) {
		return 'domain-availability';
	}
	if ( /domains\/suggestions/i.test( text ) ) {
		return 'domain-suggestions';
	}
	// `/users/new` wraps a Blackbox block in this same code, and that refuses one
	// attempt rather than banning the address, so the code alone settles it only
	// on `/sites/new`, where nothing else raises it. Little is lost: the ban is on
	// the address, not the endpoint, and a run inside one reaches `/sites/new`
	// too, every time it makes a site.
	return /sites\/new/i.test( text ) ? 'signup' : null;
}
