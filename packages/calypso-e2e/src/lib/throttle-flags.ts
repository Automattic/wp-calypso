import { fetchBuildLog, fetchBuildsByTag, tagOwnBuild } from './teamcity';

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
 * How far back a tag is worth reading. Longer than the longest ban we know of,
 * so a tag older than this cannot still be in force.
 */
const TAG_WINDOW_MS = 2 * 60 * 60 * 1000;

/**
 * What this worker has already raised. One entry per id: a worker that has seen
 * a throttle does not need to ask again, and does not re-tag or re-report.
 */
const raisedHere = new Map< ThrottleId, ThrottleFlag >();

/**
 * Forgets what this worker has raised. For tests: a worker never needs this.
 */
export function resetRaisedThrottles(): void {
	raisedHere.clear();
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

const LINE_PATTERN = /\[e2e-throttle] type=([a-z-]+) start=(\d+) duration=(\d+) end=(\d+)/;

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
 * Reads a flag back out of a build log line, ignoring anything else.
 */
export function parseThrottleLine( line: string ): ThrottleFlag | null {
	const match = LINE_PATTERN.exec( line );
	if ( ! match ) {
		return null;
	}
	const id = match[ 1 ] as ThrottleId;
	if ( ! THROTTLE_IDS.includes( id ) ) {
		return null;
	}
	return {
		id,
		raisedAtMs: Number( match[ 2 ] ),
		durationMs: Number( match[ 3 ] ),
		expiresAtMs: Number( match[ 4 ] ),
	};
}

/**
 * Reads the ban length wpcom states in its own throttle message.
 *
 * `security.php` renders "Limit reached. You can try again in %d minutes", so
 * the server is the authority on how long to stay away. Returns null when the
 * message carries no number, as `is-available` does.
 */
export function parseBanDurationMs( text: string ): number | null {
	const match = /try again in (\d+) minutes?/i.exec( text );
	return match ? Number( match[ 1 ] ) * 60_000 : null;
}

/**
 * Records a throttle this worker just hit: tags the build and prints the line.
 *
 * Both happen at once, because both are readable at once — a tag POST is in the
 * database when it returns, and a log line is queryable a second later. The
 * first raise in a worker does the work; later ones are dropped, so a build with
 * N workers writes at most N tags and N lines per id rather than one per
 * throttled request. Never throws: a build that cannot be tagged still runs.
 */
export async function raiseFlag( id: ThrottleId, durationMs?: number ): Promise< void > {
	const nowMs = Date.now();
	const known = raisedHere.get( id );
	if ( known && known.expiresAtMs > nowMs ) {
		return;
	}

	const duration = durationMs && durationMs > 0 ? durationMs : FALLBACK_DURATIONS[ id ];
	const flag: ThrottleFlag = {
		id,
		raisedAtMs: nowMs,
		durationMs: duration,
		expiresAtMs: nowMs + duration,
	};
	raisedHere.set( id, flag );

	console.warn( formatThrottleLine( flag ) );

	try {
		const status = await tagOwnBuild( throttleTag( id ) );
		// A refusal is otherwise indistinguishable from a tagged build: the status
		// is all we may print, never the error, which can carry a header derived
		// from the build token.
		if ( status !== null && ( status < 200 || status >= 300 ) ) {
			console.warn( `TeamCity refused the ${ id } throttle tag with status ${ status }.` );
		}
	} catch {
		// Recording a throttle never fails the test that found it.
	}
}

/**
 * When a throttle lifts, or null when it is not in force.
 *
 * Two sources, nearest first: what this worker has hit itself, then what the
 * pre-flight check found on other builds before the run started. Neither sees a
 * ban another worker in this build hit after the run began — by design, that
 * worker finds it the same way, by hitting it.
 */
export function throttleExpiry( id: ThrottleId, nowMs: number = Date.now() ): number | null {
	return activeThrottle( id, nowMs )?.expiresAtMs ?? null;
}

/**
 * The throttle in force and what is known about it.
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

	const value = process.env[ throttleEnvVar( id ) ];
	const expiresAtMs = value ? Number( value ) : NaN;
	return Number.isFinite( expiresAtMs ) && expiresAtMs > nowMs ? { expiresAtMs } : null;
}

/**
 * Whether a throttle is in force.
 */
export function isThrottled( id: ThrottleId, nowMs?: number ): boolean {
	return throttleExpiry( id, nowMs ) !== null;
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
 * Reporting only: the call goes ahead. This PR proves the flag is raised and
 * read back correctly, and what a build does about it — skip, fail, wait — is a
 * later decision. The line is deliberately not the one `parseThrottleLine`
 * reads, so a build cannot re-report a peer's ban as its own.
 */
export function debugThrottle( id: ThrottleId, nowMs: number = Date.now() ): void {
	const active = activeThrottle( id, nowMs );
	if ( ! active ) {
		return;
	}

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
 * Fails open in both directions the design allows for and neither is retried:
 * builds we cannot list count as no throttle at all, and a build whose log we
 * cannot read, or whose log carries no line, counts as throttled for the
 * documented length starting now — the conservative reading, since the tag is
 * proof the ban happened and only its timing is missing.
 */
export async function readActiveThrottles(
	nowMs: number = Date.now()
): Promise< Record< ThrottleId, number | null > > {
	const entries = await Promise.all(
		THROTTLE_IDS.map( async ( id ) => [ id, await readActiveThrottle( id, nowMs ) ] as const )
	);
	return Object.fromEntries( entries ) as Record< ThrottleId, number | null >;
}

/**
 * The furthest expiry one throttle carries across the builds tagged with it.
 */
async function readActiveThrottle( id: ThrottleId, nowMs: number ): Promise< number | null > {
	const builds = await fetchBuildsByTag( throttleTag( id ), { sinceMs: nowMs - TAG_WINDOW_MS } );
	if ( ! builds || builds.length === 0 ) {
		return null;
	}

	let latest = 0;
	for ( const buildId of builds ) {
		const log = await fetchBuildLog( buildId );
		const flag = log ? latestFlagInLog( log, id ) : null;
		latest = Math.max( latest, flag ? flag.expiresAtMs : nowMs + FALLBACK_DURATIONS[ id ] );
	}
	return latest > nowMs ? latest : null;
}

/**
 * The longest-lived flag of one id in a build log. A build's workers each print
 * their own line, so there is rarely only one.
 */
function latestFlagInLog( log: string, id: ThrottleId ): ThrottleFlag | null {
	let latest: ThrottleFlag | null = null;
	for ( const line of log.split( '\n' ) ) {
		const flag = parseThrottleLine( line );
		if ( flag && flag.id === id && ( ! latest || flag.expiresAtMs > latest.expiresAtMs ) ) {
			latest = flag;
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

	const throttled = /(?:^|[^a-z0-9_])throttled(?:$|[^a-z0-9_])/i.test( text );
	if ( ! throttled && ! /limit reached/i.test( text ) ) {
		return null;
	}
	if ( /is-available/i.test( text ) ) {
		return 'domain-availability';
	}
	if ( /domains\/suggestions/i.test( text ) ) {
		return 'domain-suggestions';
	}
	return throttled ? 'signup' : null;
}
