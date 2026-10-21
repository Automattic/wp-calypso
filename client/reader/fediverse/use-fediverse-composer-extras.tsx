import { useFediverseConnectionsQuery } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { useCallback, useRef } from 'react';
import { logToLogstash } from 'calypso/lib/logstash';
import { useVisibilityCwState } from 'calypso/reader/social/composer';
import { FediverseComposerControls } from './composer-controls';
import type { FediverseCreatePostParams, FediverseVisibility } from '@automattic/api-core';
import type { ActiveMode, ComposerProtocolExtrasSlot } from 'calypso/reader/social/composer';

/**
 * Generate a UUID for the `Idempotency-Key` header. Prefers
 * `crypto.randomUUID` (available in evergreen browsers + Node 19+);
 * falls back to a Math.random-based v4-ish UUID for legacy environments
 * + jest defaults. Cryptographic randomness only matters here for
 * preventing collisions, not for security.
 */
function generateIdempotencyKey(): string {
	if ( typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ) {
		return crypto.randomUUID();
	}
	// RFC4122-style fallback. Acceptable when the environment lacks
	// crypto.randomUUID — collision risk per submit attempt is negligible.
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace( /[xy]/g, ( c ) => {
		const r = ( Math.random() * 16 ) | 0;
		const v = c === 'x' ? r : ( r & 0x3 ) | 0x8;
		return v.toString( 16 );
	} );
}

function storageKeyForConnection( connectionId: number ): string {
	return `calypso_reader_fediverse_composer_visibility_v1:${ connectionId }`;
}

function isFediverseVisibility( value: unknown ): value is FediverseVisibility {
	return value === 'public' || value === 'unlisted' || value === 'followers';
}

/**
 * Per-Fediverse-connection composer-extras hook. Wraps the shared
 * `useVisibilityCwState` with Fediverse-specific concerns: reading
 * `default_visibility` from the cached connection, the per-submit
 * `Idempotency-Key` header, and projecting state into the
 * `FediverseCreatePostParams` wire shape.
 *
 * Mounted by the provider via `ComposerConfig.useProtocolExtras`. The
 * provider calls `clear()` when the modal closes so state resets
 * between sessions.
 */
export function useFediverseComposerExtras( ctx: {
	mode: ActiveMode | null;
	connectionId: number;
} ): ComposerProtocolExtrasSlot {
	const { connectionId, mode } = ctx;
	const { data } = useFediverseConnectionsQuery( {
		enabled: connectionId > 0,
	} );
	// Optional-chain `connections` defensively — the wpcom proxy can hand back a
	// 200 with `data` defined and `connections` missing (mid-deploy race on
	// CM-684), in which case `.find()` would otherwise throw. Log when that
	// happens so the silent `'public'` fallback below stays observable; without
	// the breadcrumb a proxy contract regression would silently route every
	// publish at the default visibility.
	const malformedRef = useRef( false );
	if ( data && ! Array.isArray( data.connections ) && ! malformedRef.current ) {
		malformedRef.current = true;
		logToLogstash( {
			feature: 'calypso_client',
			message: 'Fediverse connections response missing `connections` array',
			severity: config( 'env_id' ) === 'production' ? 'error' : 'debug',
			extra: {
				env: config( 'env_id' ),
				type: 'reader_fediverse_connections_malformed',
				connection_id: connectionId,
			},
		} );
	}
	const connection = data?.connections?.find( ( c ) => c.id === connectionId ) ?? null;
	const blogDefault: FediverseVisibility = connection?.default_visibility ?? 'public';

	const { visibility, setVisibility, cwEnabled, setCwEnabled, summary, setSummary, clear } =
		useVisibilityCwState< FediverseVisibility >( {
			mode,
			connectionId,
			defaultVisibility: blogDefault,
			isValidVisibility: isFediverseVisibility,
			storageKey: storageKeyForConnection,
		} );

	const renderControls = useCallback(
		() => (
			<FediverseComposerControls
				visibility={ visibility }
				onVisibilityChange={ setVisibility }
				cwEnabled={ cwEnabled }
				onCwToggle={ ( enabled ) => {
					setCwEnabled( enabled );
					if ( ! enabled ) {
						setSummary( '' );
					}
				} }
				summary={ summary }
				onSummaryChange={ setSummary }
			/>
		),
		[ visibility, setVisibility, cwEnabled, setCwEnabled, summary, setSummary ]
	);

	const extendBuildParams = useCallback(
		( params: unknown ): unknown => {
			const base = params as FediverseCreatePostParams;
			// Mint a fresh `Idempotency-Key` per submit attempt. Earlier
			// iterations of this hook held a stable key across the whole
			// modal session so the backend dedupe table could suppress a
			// publish-time network retry — but that breaks when the user
			// edits the body / visibility / CW after a failed submit:
			// same key + different body would hit the dedupe table and
			// could serve a cached failure (or a stale success) for the
			// new content. Rotating per attempt trades the (rare)
			// duplicate-publish-on-lost-response window for the (likelier)
			// stale-cache-after-edit hazard the reviewer flagged.
			return {
				...base,
				visibility,
				...( cwEnabled && summary.trim().length > 0 ? { summary } : {} ),
				idempotencyKey: generateIdempotencyKey(),
			};
		},
		[ visibility, cwEnabled, summary ]
	);

	return { renderControls, extendBuildParams, clear };
}
