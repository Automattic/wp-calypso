import { useFediverseConnectionsQuery } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { useCallback, useEffect, useRef, useState } from 'react';
import { logToLogstash } from 'calypso/lib/logstash';
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

const LAST_VISIBILITY_STORAGE_KEY = ( connectionId: number ) =>
	`calypso_reader_fediverse_composer_visibility_v1:${ connectionId }`;

function isVisibility( value: unknown ): value is FediverseVisibility {
	return value === 'public' || value === 'unlisted' || value === 'followers';
}

function readLastVisibility( connectionId: number ): FediverseVisibility | null {
	try {
		const raw = window.localStorage.getItem( LAST_VISIBILITY_STORAGE_KEY( connectionId ) );
		return isVisibility( raw ) ? raw : null;
	} catch {
		// Private-mode storage access, etc. — silently fall back to the blog default.
		return null;
	}
}

function writeLastVisibility( connectionId: number, value: FediverseVisibility ): void {
	try {
		window.localStorage.setItem( LAST_VISIBILITY_STORAGE_KEY( connectionId ), value );
	} catch {
		// Best-effort persistence; cosmetic feature.
	}
}

/**
 * Per-Fediverse-connection composer-extras hook. Owns the state for the
 * three protocol-specific controls (visibility, content-warning toggle +
 * summary, sensitive flag) and projects them into the wire payload via
 * `extendBuildParams`.
 *
 * Visibility defaults: user's last pick (localStorage, keyed on
 * connection id) → blog's `default_visibility` from the connections
 * endpoint → `'public'`. Persists the user's pick on submit so
 * subsequent composes default to it. Per CM-704: cosmetic — backend
 * doesn't care.
 *
 * Mounted by the provider via `ComposerConfig.useProtocolExtras`. The
 * provider calls `clear()` when the modal closes so state resets between
 * sessions.
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
	const blogDefault = connection?.default_visibility ?? 'public';

	const [ visibility, setVisibility ] = useState< FediverseVisibility >( blogDefault );
	const [ cwEnabled, setCwEnabled ] = useState( false );
	const [ summary, setSummary ] = useState( '' );

	// Apply localStorage override / blog default once the modal opens. Re-runs
	// when the connection changes (the user navigates between connections
	// without closing the modal — rare but supported).
	useEffect( () => {
		if ( ! mode ) {
			return;
		}
		const stored = readLastVisibility( connectionId );
		setVisibility( stored ?? blogDefault );
	}, [ mode, connectionId, blogDefault ] );

	const renderControls = useCallback(
		() => (
			<FediverseComposerControls
				visibility={ visibility }
				onVisibilityChange={ ( next ) => {
					setVisibility( next );
					writeLastVisibility( connectionId, next );
				} }
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
		[ visibility, cwEnabled, summary, connectionId ]
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

	const clear = useCallback( () => {
		setVisibility( blogDefault );
		setCwEnabled( false );
		setSummary( '' );
	}, [ blogDefault ] );

	return { renderControls, extendBuildParams, clear };
}
