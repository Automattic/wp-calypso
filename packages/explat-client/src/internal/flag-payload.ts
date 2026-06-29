import { asyncOneAtATime } from './timing';
import { isObject } from './validations';
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

/**
 * Lazy-load and cache the flag payload.
 *
 * Returns null on any failure (fetch error, unsupported schema_version,
 * malformed body) — callers fall back to the caller-provided default value.
 *
 * Concurrent calls before the first fetch resolves share a single in-flight
 * promise so we never dispatch N parallel `/flags` requests on cold cache.
 */
export function createFlagPayloadLoader(
	fetchPayload: () => Promise< unknown >,
	logError: Config[ 'logError' ]
): () => Promise< FlagPayload | null > {
	let cache: FlagPayloadCache | null = null;

	const fetchAndCache = asyncOneAtATime( async (): Promise< FlagPayload | null > => {
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
	} );

	return async function loadFlagPayload(): Promise< FlagPayload | null > {
		if ( cache && cache.expiresAt > Date.now() ) {
			return cache.payload;
		}
		return fetchAndCache();
	};
}

function parsePayload( raw: unknown, logError: Config[ 'logError' ] ): FlagPayload | null {
	if ( ! isObject( raw ) ) {
		return null;
	}
	if ( raw.schema_version !== SCHEMA_VERSION_SUPPORTED ) {
		logError( {
			message: `Unsupported flag payload schema_version=${ String( raw.schema_version ) }`,
			source: 'loadFlagPayload-unsupportedSchema',
		} );
		return null;
	}
	return {
		schema_version: raw.schema_version,
		flags: normalizeFlags( ( raw.flags as Record< string, Feature > ) ?? {} ),
		ttl: typeof raw.ttl === 'number' ? raw.ttl : DEFAULT_TTL_SECONDS,
	};
}

/**
 * Bridge the canonical payload shape (`rule.ranges: [number,number][]`) to
 * the SDK's inline `variation.range` shape. The payload from the wpcom
 * flag-compiler emits the canonical form; the SDK in
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
