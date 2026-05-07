import {
	useAuthorizeMastodonConnectionMutation,
	useMastodonAuthStatusQuery,
} from '@automattic/api-queries';
import { createInterpolateElement } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { ReactNode, useEffect, useRef } from 'react';
import { logToLogstash } from 'calypso/lib/logstash';
import { ConnectionReauthGate } from 'calypso/reader/social';
import { useDispatch } from 'calypso/state';
import { errorNotice } from 'calypso/state/notices/actions';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { isSafeReturnPath, saveOauthState } from './oauth-state';
import { useMastodonAuthStatusInvalidator } from './use-mastodon-auth-status-invalidator';
import type { MastodonConnection } from '@automattic/api-core';

// Adapter that maps `useMastodonAuthStatusQuery`'s shape to the gate's
// `useAuthStatus` contract. Must be named with a `use` prefix so the
// rules-of-hooks linter recognises it when passed as a hook prop.
export function useMastodonAuthStatusForGate( connectionId: number ) {
	const r = useMastodonAuthStatusQuery( connectionId );
	return { needsReauth: r.data?.needs_reauth };
}

// Defence in depth — `authorize()` should only ever return an `https:`
// authorize URL on the user's instance, but a hostile or buggy upstream
// could theoretically return something else. Refuse to navigate anywhere
// that isn't `https:` on the same host the user opted to reconnect to.
function isSafeAuthorizeUrl( url: string, instance: string ): boolean {
	try {
		const parsed = new URL( url );
		if ( parsed.protocol !== 'https:' ) {
			return false;
		}
		// Pinning to the connection's instance means a hostile upstream can't
		// redirect a reconnect attempt off to an attacker-controlled host. The
		// connection's instance is the host the user explicitly chose to
		// reauthorize against, so any other host is by definition wrong.
		return parsed.host.toLowerCase() === instance.toLowerCase();
	} catch {
		// `new URL()` only throws on un-parseable input — that points at a
		// wpcom-side regression returning gibberish rather than the deliberate
		// http/wrong-host rejections above. Log to logstash so we can find it
		// in dashboards; the caller still surfaces the user-visible notice via
		// the `unsafe_url` errorNotice.
		logToLogstash( {
			feature: 'calypso_client',
			message: 'Reader Mastodon authorize_url failed to parse',
			severity: 'error',
			extra: {
				type: 'reader_mastodon_authorize_url_parse_error',
				instance,
			},
		} );
		return false;
	}
}

interface MastodonReauthGateProps {
	connection: MastodonConnection;
	children: ReactNode;
}

/**
 * Per-connection reauth gate for Mastodon Reader surfaces. Wrap the
 * inner content of any per-connection view with this component — when
 * `auth-status` reports `needs_reauth: true` the children are replaced
 * by the reconnect prompt, the gate-shown Tracks event fires once per
 * needs_reauth=true edge, and the reconnect button kicks off the OAuth
 * handshake (saving the current path so the user lands back where they
 * started after callback). Mounting this component also subscribes to
 * the Mastodon query cache so an `auth_required` error from any inner
 * query invalidates auth-status and re-renders.
 *
 * Consumers that render the composer (FAB / modal) should also read
 * `useMastodonReauthGateState(connection.id)` to hide composer affordances
 * while needs_reauth is true; the FAB sits outside the gate, so without
 * an explicit guard it would float over the reauth prompt.
 */
export function MastodonReauthGate( { connection, children }: MastodonReauthGateProps ) {
	const translate = useTranslate();
	const { onReconnect, isReconnecting } = useMastodonReauthHandler( connection );

	return (
		<ConnectionReauthGate
			connectionId={ connection.id }
			useAuthStatus={ useMastodonAuthStatusForGate }
			onReconnect={ onReconnect }
			isReconnecting={ isReconnecting }
			headline={ translate( 'Reconnect to update permissions' ) as string }
			body={ createInterpolateElement(
				translate(
					'Your <strong>%(handle)s</strong> connection needs to be refreshed to keep working with new Reader features.',
					{ args: { handle: connection.handle } }
				) as string,
				{ strong: <strong /> }
			) }
			buttonLabel={
				translate( 'Reconnect on %(instance)s', {
					args: { instance: connection.instance },
				} ) as string
			}
		>
			{ children }
		</ConnectionReauthGate>
	);
}

/**
 * Read-only auth-status state for a Mastodon connection. Use this from
 * components that render the composer alongside `<MastodonReauthGate>`
 * so they can hide compose affordances while `needsReauth` is true —
 * any post submitted via the FAB would fail with auth_required anyway,
 * and the FAB sits outside the gate so it would otherwise float over
 * the reauth prompt.
 *
 * Safe to call alongside `<MastodonReauthGate>` on the same view: React
 * Query dedupes on key, so the gate's adapter and this hook share one
 * fetch.
 */
export function useMastodonReauthGateState( connectionId: number | null ) {
	const r = useMastodonAuthStatusQuery( connectionId );
	return { needsReauth: r.data?.needs_reauth === true };
}

/**
 * Internal hook hosting the reconnect handler, the gate-shown Tracks
 * effect, the auth-status invalidator subscription, and the
 * mounted-ref guard. Encapsulated so every per-connection view shares
 * the same telemetry and the same return-path / safety checks without
 * copy-pasting.
 */
function useMastodonReauthHandler( connection: MastodonConnection ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const authorize = useAuthorizeMastodonConnectionMutation();

	// Subscribe to the mastodon query cache; any auth_required error
	// invalidates auth-status so the gate refetches and re-renders.
	useMastodonAuthStatusInvalidator( connection.id );

	// Top-level read of auth-status so this hook can fire the gate-shown
	// Tracks event. The gate's adapter calls `useMastodonAuthStatusQuery`
	// against the same key, so React Query dedupes — one fetch.
	const authStatus = useMastodonAuthStatusQuery( connection.id );

	const gateShownConnectionId = useRef< number | null >( null );
	useEffect( () => {
		if (
			authStatus.data?.needs_reauth === true &&
			gateShownConnectionId.current !== connection.id
		) {
			dispatch(
				recordReaderTracksEvent( 'calypso_reader_reauth_gate_shown', {
					provider: 'mastodon',
					connection_id: connection.id,
					trigger: 'auth-status',
				} )
			);
			gateShownConnectionId.current = connection.id;
		} else if ( authStatus.data?.needs_reauth === false ) {
			// Reset the dedupe guard once the connection is healthy again so
			// a later token expiry in the same session re-fires the
			// `gate_shown` event. Without this reset the second
			// needs_reauth=true edge would be silently swallowed and Tracks
			// would under-count repeat reauth prompts.
			if ( gateShownConnectionId.current === connection.id ) {
				gateShownConnectionId.current = null;
			}
		}
		// connection.id is the load-bearing identity here; we don't want
		// to refire on connection-object identity churn from React Query.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ connection.id, authStatus.data?.needs_reauth, dispatch ] );

	// Tracks whether the component is still mounted so a slow authorize()
	// resolution can't yank the user off a page they navigated to during
	// the round trip. Also short-circuits double-clicks before
	// authorize.isPending flips.
	const mountedRef = useRef( true );
	useEffect( () => {
		mountedRef.current = true;
		return () => {
			mountedRef.current = false;
		};
	}, [] );

	const onReconnect = () => {
		if ( authorize.isPending ) {
			return;
		}
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_reauth_button_clicked', {
				provider: 'mastodon',
				connection_id: connection.id,
			} )
		);
		const rawReturnPath = window.location.pathname + window.location.search;
		const returnPath = isSafeReturnPath( rawReturnPath ) ? rawReturnPath : undefined;
		authorize.mutate(
			{ instance: connection.instance },
			{
				onSuccess: ( { authorize_url, state } ) => {
					if ( ! mountedRef.current ) {
						// The user navigated away (or the connection list
						// resolved to a different connection) while authorize
						// was in flight. Don't yank them off whatever page they
						// landed on. Emit a Tracks event so this branch is
						// distinguishable from a hung mutation in dashboards
						// when users report "I clicked reconnect, nothing
						// happened".
						dispatch(
							recordReaderTracksEvent( 'calypso_reader_mastodon_authorize_aborted', {
								reason: 'unmounted',
								connection_id: connection.id,
							} )
						);
						return;
					}
					if ( ! isSafeAuthorizeUrl( authorize_url, connection.instance ) ) {
						dispatch(
							errorNotice(
								translate( 'We couldn’t start the reconnect safely. Please try again.' ),
								{ duration: 5000 }
							)
						);
						dispatch(
							recordReaderTracksEvent( 'calypso_reader_mastodon_authorize_error', {
								reason: 'unsafe_url',
							} )
						);
						return;
					}
					const saved = saveOauthState( {
						state,
						instance: connection.instance,
						returnPath,
						reconnectingConnectionId: connection.id,
					} );
					if ( ! saved ) {
						// sessionStorage was unavailable. The callback view
						// validates `state` against the stored value, so without
						// it the round-trip would always fail — refuse to redirect.
						dispatch(
							errorNotice(
								translate( 'We couldn’t start the reconnect safely. Please try again.' ),
								{ duration: 5000 }
							)
						);
						dispatch(
							recordReaderTracksEvent( 'calypso_reader_mastodon_authorize_error', {
								reason: 'state_persist_failed',
							} )
						);
						return;
					}
					window.location.assign( authorize_url );
				},
				onError: ( error ) => {
					dispatch(
						errorNotice( translate( 'Could not start the reconnect. Please try again.' ), {
							duration: 5000,
						} )
					);
					dispatch(
						recordReaderTracksEvent( 'calypso_reader_mastodon_authorize_error', {
							reason: 'authorize_failed',
							error_kind: error.kind,
						} )
					);
				},
			}
		);
	};

	return { onReconnect, isReconnecting: authorize.isPending };
}
