import { fetchBuildsByTag, setOwnBuildComment, tagOwnBuild } from './teamcity';
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
 * States every ban this worker still holds on the build itself, and says
 * whether the build now carries them.
 *
 * All of them, because a comment is one field and a PUT replaces it whole: a
 * worker stating only the id it just hit would leave the build tagged for the
 * others with nothing to read, and a tag without a statement counts for nothing.
 *
 * They are restated from this worker's own copy, which another worker may
 * already have moved past, so an expiry can go out shorter than the one it
 * replaces. That is worth it. A ban stated too short is still a ban a peer sits
 * out, and it lapses into the same silence that dropping the id would have
 * caused immediately — later, and never sooner. Peers read the furthest expiry
 * they can see, so nothing here can pull a fresher statement down.
 *
 * Ones that have already run out are left off: a lapsed statement and no
 * statement read alike, and the field is easier to read without them.
 *
 * The line format is the one `flagsInLog` already reads, so what a peer parses
 * does not depend on where it was written.
 */
async function publishFlags( flag: ThrottleFlag ): Promise< boolean > {
	const nowMs = Date.now();
	const stated = new Map( raisedHere ).set( flag.id, flag );
	const text = [ ...stated.values() ]
		.filter( ( known ) => known.expiresAtMs > nowMs )
		.map( formatThrottleLine )
		.join( ' ' );

	try {
		const status = await setOwnBuildComment( text );
		// No build to write on is a local run, where there is no peer to read it
		// either and the worker's own copy is the whole point.
		return status === null || ( status >= 200 && status < 300 );
	} catch {
		return false;
	}
}

/**
 * Records a throttle this worker just hit: states it on the build, then tags.
 *
 * That order, and nothing recorded until the first half of it lands. A tag is
 * what makes a build findable, so tagging a build that does not yet state its
 * ban publishes a build a peer can find and learn nothing from. A ban this
 * build could not state is one it must behave as though it never saw: nothing
 * kept here, nothing tagged, and the next refusal — which a throttled endpoint
 * will supply — tries the whole thing again.
 *
 * The tag is retried until it lands or is refused often enough to be settled.
 * Never throws: a build that cannot say it was throttled still runs.
 */
export async function raiseFlag( id: ThrottleId ): Promise< void > {
	const nowMs = Date.now();
	const duration = BAN_DURATIONS[ id ];
	const expiresAtMs = nowMs + duration;

	const known = raisedHere.get( id );
	const live = known && known.expiresAtMs > nowMs ? known : null;

	// Refused again while the ban is in force: coming back early lengthens it, so
	// the expiry moves out, and the comment is the only place a peer can read
	// that. Restated as the ban ages rather than on every refusal: the endpoints
	// that answer one refusal per keystroke would otherwise spend a request each,
	// so a peer's copy of the expiry is at most a tenth of a ban behind this
	// worker's.
	if ( live && nowMs - live.raisedAtMs < duration / 10 ) {
		raisedHere.set( id, { ...live, expiresAtMs } );
	} else {
		const flag: ThrottleFlag = { id, raisedAtMs: nowMs, durationMs: duration, expiresAtMs };
		if ( ! ( await publishFlags( flag ) ) ) {
			return;
		}
		raisedHere.set( id, flag );
		// Not a line `EVERY_LINE` matches: the build states its bans in its
		// comment, and this is only so a person reading the log knows why.
		console.warn(
			`wpcom is throttling ${ id } for ${ approximately( duration ) }; stated on this build.`
		);
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
 * Three answers per id, not two: a number is a ban that reaches that far, null is
 * a look that found none, and a missing key is a look that could not be taken.
 * The last covers the lookup itself being refused — an id nothing can be said
 * about is not an id with nothing to report, and nothing is retried.
 *
 * A tag alone reports nothing. Only a build that states a ban still in force
 * counts, so a tagged build whose comment says nothing about this id is passed
 * over rather than dated from its own clock. What that costs is a ban going
 * unreported until somebody runs into it, which is how every ban here is found
 * in the first place; what it buys is that no expiry is ever published that no
 * build ever stated.
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

	// Each build states its bans in its own comment, which the lookup above
	// already carried back. Nothing further to fetch, and nothing to budget: what
	// used to cost a log download per tagged build now costs the request that
	// found it.
	const active: Partial< Record< ThrottleId, number | null > > = {};
	for ( const { id, builds, looked } of listed ) {
		if ( looked ) {
			active[ id ] = furthestExpiry( id, nowMs, builds );
		}
	}
	return active;
}

/**
 * The furthest expiry one throttle carries across the builds tagged with it.
 */
function furthestExpiry(
	id: ThrottleId,
	nowMs: number,
	builds: TaggedBuild[] | null
): number | null {
	let latest = 0;
	for ( const build of builds ?? [] ) {
		// A tagged build that states nothing about this id is passed over. Its
		// comment was taken by another worker, or its statement never landed, and
		// dating a ban from the build's own clock would publish an expiry no build
		// ever gave. A lapsed statement goes the same way, being no further off
		// than none at all.
		latest = Math.max( latest, flagsInLog( build.comment ).get( id )?.expiresAtMs ?? 0 );
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
	// `/users/new` wraps a Blackbox block in this same code, and that refuses one
	// attempt rather than banning the address, so the code alone settles it only
	// on `/sites/new`, where nothing else raises it. Little is lost: the ban is on
	// the address, not the endpoint, and a run inside one reaches `/sites/new`
	// too, every time it makes a site.
	return THROTTLED_PATHS.signup.test( text ) ? 'signup' : null;
}
