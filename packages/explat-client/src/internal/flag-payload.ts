import type { Feature } from '../sdk/types';

export type FlagPayload = {
	schema_version: number;
	flags: Record< string, Feature >;
	ttl: number;
};

export type FlagPayloadCache = {
	payload: FlagPayload;
	expiresAt: number;
};

export type LogError = ( error: Record< string, string > & { message: string } ) => void;

const SCHEMA_VERSION_SUPPORTED = 1;
const DEFAULT_TTL_SECONDS = 7200;

/**
 * Lazy-load and cache the flag payload. Returns null on any failure (fetch
 * error, unsupported schema_version, malformed body) — callers fall back to
 * the caller-provided default value.
 */
export async function loadFlagPayload(
	fetchPayload: () => Promise< unknown >,
	cache: { current: FlagPayloadCache | null },
	logError: LogError
): Promise< FlagPayload | null > {
	const now = Date.now();
	if ( cache.current && cache.current.expiresAt > now ) {
		return cache.current.payload;
	}
	try {
		const raw = await fetchPayload();
		const payload = parsePayload( raw, logError );
		if ( ! payload ) {
			return null;
		}
		cache.current = {
			payload,
			expiresAt: now + payload.ttl * 1000,
		};
		return payload;
	} catch ( e ) {
		logError( {
			message: ( e as Error ).message,
			source: 'loadFlagPayload-fetchError',
		} );
		return null;
	}
}

function parsePayload( raw: unknown, logError: LogError ): FlagPayload | null {
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
		flags: ( obj.flags as Record< string, Feature > ) ?? {},
		ttl: typeof obj.ttl === 'number' ? obj.ttl : DEFAULT_TTL_SECONDS,
	};
}
