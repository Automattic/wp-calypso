import type { Feature, Range } from '../sdk/types';
import type { Config } from '../types';

export type FlagPayload = {
	schema_version: number;
	flags: Record< string, Feature >;
	ttl: number;
};

export type FlagPayloadCache = {
	payload: FlagPayload;
	expiresAt: number;
};

const SCHEMA_VERSION_SUPPORTED = 1;
const DEFAULT_TTL_SECONDS = 7200;

export interface FlagPayloadLoader {
	/**
	 * Lazy-load and cache the flag payload.
	 *
	 * Returns null on any failure (fetch error, unsupported schema_version,
	 * malformed body) — callers fall back to the caller-provided default value.
	 *
	 * Concurrent calls before the first fetch resolves share a single in-flight
	 * promise so we never dispatch N parallel `/flags` requests on cold cache.
	 *
	 * Pass `{ force: true }` to bypass the TTL cache and dispatch a fresh fetch
	 * (used by the dev panel's Refresh button). An in-flight non-forced load is
	 * still shared; a forced call always starts its own request.
	 */
	load: ( options?: { force?: boolean } ) => Promise< FlagPayload | null >;
	/**
	 * Returns the currently cached payload without triggering a fetch.
	 * Used by devtools helpers (`getKnownFlags`, `getKnownVariations`,
	 * `getRawFeature`) that surface flag metadata for in-page UI without
	 * paying a network round trip.
	 */
	getCached: () => FlagPayload | null;
}

export function createFlagPayloadLoader(
	fetchPayload: () => Promise< unknown >,
	logError: Config[ 'logError' ]
): FlagPayloadLoader {
	let cache: FlagPayloadCache | null = null;
	let inflight: Promise< FlagPayload | null > | null = null;

	const load = async ( options?: { force?: boolean } ): Promise< FlagPayload | null > => {
		const force = options?.force === true;
		const now = Date.now();
		if ( ! force && cache && cache.expiresAt > now ) {
			return cache.payload;
		}
		if ( ! force && inflight ) {
			return inflight;
		}
		const fetchPromise: Promise< FlagPayload | null > = ( async () => {
			try {
				const raw = await fetchPayload();
				const payload = parsePayload( raw, logError );
				if ( ! payload ) {
					return null;
				}
				cache = {
					payload,
					expiresAt: Date.now() + payload.ttl * 1000,
				};
				return payload;
			} catch ( e ) {
				logError( {
					message: ( e as Error ).message,
					source: 'loadFlagPayload-fetchError',
				} );
				return null;
			}
		} )();
		// Forced refreshes don't park themselves in the shared inflight slot —
		// concurrent non-forced callers shouldn't be forced to wait on a forced
		// refetch, and a non-forced inflight should still be reusable.
		if ( ! force ) {
			inflight = fetchPromise;
		}
		// Clear the shared inflight slot once this fetch resolves, but only if
		// it's still pointing at us (a forced refresh may have replaced it).
		void fetchPromise.finally( () => {
			if ( inflight === fetchPromise ) {
				inflight = null;
			}
		} );
		return fetchPromise;
	};

	const getCached = (): FlagPayload | null => {
		if ( cache && cache.expiresAt > Date.now() ) {
			return cache.payload;
		}
		return null;
	};

	return { load, getCached };
}

function parsePayload( raw: unknown, logError: Config[ 'logError' ] ): FlagPayload | null {
	if ( typeof raw !== 'object' || raw === null ) {
		return null;
	}
	const obj = raw as Record< string, unknown >;
	if ( obj.schema_version !== SCHEMA_VERSION_SUPPORTED ) {
		logError( {
			message: `Unsupported flag payload schema_version=${ String( obj.schema_version ) }`,
			source: 'loadFlagPayload-unsupportedSchema',
		} );
		return null;
	}
	return {
		schema_version: obj.schema_version,
		flags: normalizeFlags( ( obj.flags as Record< string, Feature > ) ?? {} ),
		ttl: typeof obj.ttl === 'number' ? obj.ttl : DEFAULT_TTL_SECONDS,
	};
}

/**
 * Bridge the canonical contract shape (`rule.ranges: [number,number][]` per
 * `00-contracts.md` § 6) to the SDK's inline `variation.range` shape. The
 * payload from the wpcom flag-compiler emits the canonical form; the SDK in
 * `packages/explat-client/src/sdk` reads `variations[i].range`. Distribute
 * `rule.ranges[i]` onto each variation here so callers don't notice the
 * difference. Already-inline payloads (e.g. unit-test fixtures) pass through
 * unchanged.
 */
function normalizeFlags( flags: Record< string, Feature > ): Record< string, Feature > {
	const result: Record< string, Feature > = {};
	for ( const [ key, feature ] of Object.entries( flags ) ) {
		result[ key ] = { ...feature, rules: feature.rules?.map( normalizeRule ) ?? [] };
	}
	return result;
}

function normalizeRule( rule: unknown ): Feature[ 'rules' ][ number ] {
	if ( ! rule || typeof rule !== 'object' || ( rule as { type: string } ).type !== 'experiment' ) {
		return rule as Feature[ 'rules' ][ number ];
	}
	const r = rule as { ranges?: Range[]; variations?: Array< Record< string, unknown > > };
	if ( ! Array.isArray( r.ranges ) || ! Array.isArray( r.variations ) ) {
		return rule as Feature[ 'rules' ][ number ];
	}
	const variations = r.variations.map( ( variation, i ) =>
		variation && typeof variation === 'object' && variation.range === undefined
			? { ...variation, range: r.ranges![ i ] }
			: variation
	);
	return { ...( rule as object ), variations } as unknown as Feature[ 'rules' ][ number ];
}
