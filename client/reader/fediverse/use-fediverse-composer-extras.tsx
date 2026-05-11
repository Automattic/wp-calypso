import { useFediverseConnectionsQuery } from '@automattic/api-queries';
import { useCallback, useEffect, useRef, useState } from 'react';
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
	const connection = data?.connections.find( ( c ) => c.id === connectionId ) ?? null;
	const blogDefault = connection?.default_visibility ?? 'public';

	const [ visibility, setVisibility ] = useState< FediverseVisibility >( blogDefault );
	const [ cwEnabled, setCwEnabled ] = useState( false );
	const [ summary, setSummary ] = useState( '' );
	const [ sensitive, setSensitive ] = useState( false );
	// One Idempotency-Key per modal session — stays stable across user-initiated
	// retries after a network error so the backend's de-dupe table can suppress
	// the duplicate publish. Rotates only when the modal closes (`clear`).
	const idempotencyKeyRef = useRef< string | null >( null );

	// Apply localStorage override / blog default once the modal opens. Re-runs
	// when the connection changes (the user navigates between connections
	// without closing the modal — rare but supported).
	useEffect( () => {
		if ( ! mode ) {
			return;
		}
		const stored = readLastVisibility( connectionId );
		setVisibility( stored ?? blogDefault );
		if ( ! idempotencyKeyRef.current ) {
			idempotencyKeyRef.current = generateIdempotencyKey();
		}
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
				sensitive={ sensitive }
				onSensitiveToggle={ setSensitive }
			/>
		),
		[ visibility, cwEnabled, summary, sensitive, connectionId ]
	);

	const extendBuildParams = useCallback(
		( params: unknown ): unknown => {
			const base = params as FediverseCreatePostParams;
			// Lazy-init in case `extendBuildParams` somehow runs before the
			// `mode → open` effect (e.g. submit fires on the same render the
			// modal opens). Cheap.
			if ( ! idempotencyKeyRef.current ) {
				idempotencyKeyRef.current = generateIdempotencyKey();
			}
			return {
				...base,
				visibility,
				...( cwEnabled && summary.trim().length > 0 ? { summary } : {} ),
				...( sensitive ? { sensitive: true } : {} ),
				idempotencyKey: idempotencyKeyRef.current,
			};
		},
		[ visibility, cwEnabled, summary, sensitive ]
	);

	const clear = useCallback( () => {
		setVisibility( blogDefault );
		setCwEnabled( false );
		setSummary( '' );
		setSensitive( false );
		idempotencyKeyRef.current = null;
	}, [ blogDefault ] );

	return { renderControls, extendBuildParams, clear };
}
