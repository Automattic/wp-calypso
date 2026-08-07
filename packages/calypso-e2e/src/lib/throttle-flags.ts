import { mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fetchProjectBuildTags, tagOwnBuild } from './teamcity';

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

const TAG_PATTERN = new RegExp( `^throttle-(${ THROTTLE_IDS.join( '|' ) })-(\\d+)$` );

/**
 * Where this process writes its own flags. One file per PID, so workers never
 * contend.
 */
function flagsDir(): string {
	return (
		process.env.E2E_THROTTLE_FLAGS_DIR || path.resolve( process.cwd(), 'output/throttle-flags' )
	);
}

/**
 * Narrows an unknown value to a flag.
 */
function isFlag( value: unknown ): value is ThrottleFlag {
	if ( ! value || typeof value !== 'object' ) {
		return false;
	}
	const flag = value as Partial< ThrottleFlag >;
	return (
		THROTTLE_IDS.includes( flag.id as ThrottleId ) &&
		Number.isFinite( flag.raisedAtMs ) &&
		Number.isFinite( flag.durationMs ) &&
		Number.isFinite( flag.expiresAtMs )
	);
}

/**
 * Parses a flag file's contents, discarding anything malformed.
 */
function parseFlags( value: string ): ThrottleFlag[] {
	try {
		const parsed: unknown = JSON.parse( value );
		return Array.isArray( parsed ) ? parsed.filter( isFlag ) : [];
	} catch {
		return [];
	}
}

/**
 * Reads one flag file, treating an unreadable file as empty.
 */
function readFileFlags( file: string ): ThrottleFlag[] {
	try {
		return parseFlags( readFileSync( file, 'utf8' ) );
	} catch {
		return [];
	}
}

/**
 * Reads every flag this build's workers have written.
 */
function readLocalFlags(): ThrottleFlag[] {
	const dir = flagsDir();
	try {
		return readdirSync( dir )
			.filter( ( file ) => file.endsWith( '.json' ) )
			.flatMap( ( file ) => readFileFlags( path.join( dir, file ) ) );
	} catch {
		return [];
	}
}

/**
 * Drops expired flags and keeps the longest-lived one per id.
 */
export function mergeFlags(
	flags: readonly ThrottleFlag[],
	nowMs: number = Date.now()
): ThrottleFlag[] {
	const active = new Map< ThrottleId, ThrottleFlag >();
	for ( const flag of flags ) {
		if ( ! isFlag( flag ) || flag.expiresAtMs <= nowMs ) {
			continue;
		}
		const current = active.get( flag.id );
		if ( ! current || flag.expiresAtMs > current.expiresAtMs ) {
			active.set( flag.id, flag );
		}
	}
	return [ ...active.values() ].sort( ( left, right ) => left.id.localeCompare( right.id ) );
}

/**
 * Renders a flag as a TeamCity build tag.
 */
export function formatFlagTag( flag: ThrottleFlag ): string {
	return `throttle-${ flag.id }-${ flag.expiresAtMs }`;
}

/**
 * Reads a flag back from a build tag, or null if the tag is not one of ours.
 *
 * The shape is matched strictly rather than by prefix: unrelated tags starting
 * with `throttle-` must not be mistaken for flags. A tag carries no raise time,
 * so it is reconstructed from the fallback duration; only the id and the expiry
 * are ever used.
 */
export function parseFlagTag( tag: string ): ThrottleFlag | null {
	const match = TAG_PATTERN.exec( tag );
	if ( ! match ) {
		return null;
	}
	const id = match[ 1 ] as ThrottleId;
	const expiresAtMs = Number( match[ 2 ] );
	const durationMs = FALLBACK_DURATIONS[ id ];
	return { id, raisedAtMs: expiresAtMs - durationMs, durationMs, expiresAtMs };
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
 * Records a throttle locally and, on CI, tags the build so other builds see it.
 *
 * The local file lands first and synchronously: workers in this build share a
 * filesystem, so that is the fastest path to them. Re-raising an id that is
 * already active in this process is a no-op, so a ban is never extended by our
 * own bookkeeping.
 */
export async function raiseFlag( id: ThrottleId, durationMs?: number ): Promise< void > {
	const nowMs = Date.now();
	const dir = flagsDir();
	const file = path.join( dir, `${ process.pid }.json` );
	const tmp = `${ file }.tmp`;
	let raised: ThrottleFlag | null = null;

	try {
		const existing = mergeFlags( readFileFlags( file ), nowMs );
		if ( existing.some( ( flag ) => flag.id === id ) ) {
			return;
		}

		const duration = durationMs && durationMs > 0 ? durationMs : FALLBACK_DURATIONS[ id ];
		raised = { id, raisedAtMs: nowMs, durationMs: duration, expiresAtMs: nowMs + duration };

		mkdirSync( dir, { recursive: true } );
		writeFileSync( tmp, JSON.stringify( mergeFlags( [ ...existing, raised ] ) ) + '\n' );
		renameSync( tmp, file );
	} catch ( error ) {
		try {
			rmSync( tmp, { force: true } );
		} catch {}
		console.warn( `Failed to record E2E throttle flag ${ id }: ${ error }` );
		return;
	}

	await tagOwnBuild( formatFlagTag( raised ) );
}

/**
 * Slugs throttled according to this build's own workers. Synchronous and free,
 * so it suits a per-test check.
 */
export function readLocalActiveSlugs( nowMs: number = Date.now() ): Set< ThrottleId > {
	return new Set( mergeFlags( readLocalFlags(), nowMs ).map( ( flag ) => flag.id ) );
}

/**
 * Slugs throttled according to this build and every recent build in the
 * project. Costs one memoised request, so it suits a per-suite check.
 *
 * If the project cannot be read the local view stands on its own: an unknown
 * remote state means "not throttled", never "wait".
 */
export async function readActiveSlugs( nowMs: number = Date.now() ): Promise< Set< ThrottleId > > {
	const tags = await fetchProjectBuildTags();
	const remote = ( tags ?? [] )
		.map( parseFlagTag )
		.filter( ( flag ): flag is ThrottleFlag => flag !== null );

	return new Set(
		mergeFlags( [ ...readLocalFlags(), ...remote ], nowMs ).map( ( flag ) => flag.id )
	);
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
 */
function detectThrottleId( text: string ): ThrottleId | null {
	if ( /domain_availability_throttle/i.test( text ) ) {
		return 'domain-availability';
	}
	if ( /domain_suggestions_throttled/i.test( text ) ) {
		return 'domain-suggestions';
	}
	if ( /(?:^|[^a-z0-9_])throttled(?:$|[^a-z0-9_])/i.test( text ) ) {
		return 'signup';
	}
	if ( /is-available/i.test( text ) && /limit reached/i.test( text ) ) {
		return 'domain-availability';
	}
	return null;
}
