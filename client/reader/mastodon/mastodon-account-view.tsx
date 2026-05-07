import {
	useAuthorizeMastodonConnectionMutation,
	useMastodonAuthStatusQuery,
	useMastodonConnectionQuery,
	useMastodonConnectionsQuery,
} from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import NavigationHeader from 'calypso/components/navigation-header';
import ReaderMain from 'calypso/reader/components/reader-main';
import { ConnectionReauthGate } from 'calypso/reader/social';
import { ComposeFab, ComposerModal, ComposerProvider } from 'calypso/reader/social/composer';
import { useDispatch } from 'calypso/state';
import { errorNotice } from 'calypso/state/notices/actions';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { mastodonComposerConfig } from './composer-config';
import { PROFILE_TAB, SETTINGS_TAB, TIMELINE_TAB } from './helper';
import { MastodonNavigation } from './mastodon-navigation';
import { isSafeReturnPath, saveOauthState } from './oauth-state';
import { ProfilePanel } from './profile-panel';
import { SettingsPanel } from './settings-panel';
import { TimelinePanel } from './timeline-panel';
import { useMastodonAuthStatusInvalidator } from './use-mastodon-auth-status-invalidator';
import type { MastodonConnection } from '@automattic/api-core';

const VALID_TABS = new Set( [ TIMELINE_TAB, PROFILE_TAB, SETTINGS_TAB ] );

interface Props {
	connectionId: number;
	tab: string;
}

// Adapter that maps `useMastodonAuthStatusQuery`'s shape to the gate's
// `useAuthStatus` contract. Must be named with a `use` prefix so the
// rules-of-hooks linter recognises it when passed as a hook prop.
function useMastodonAuthStatusForGate( connectionId: number ) {
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
		return false;
	}
}

export function MastodonAccountView( { connectionId, tab }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const { data, isPending } = useMastodonConnectionsQuery();

	const connections = data?.connections ?? [];
	const connection = connections.find( ( c ) => c.id === connectionId ) ?? null;
	const tabValid = VALID_TABS.has( tab );

	// The list endpoint omits display_name for Mastodon connections (it comes
	// back null), so the header would otherwise fall back to the raw handle
	// for the title and duplicate it as the subtitle. The details endpoint has
	// the display name; React Query dedupes by key, so ProfilePanel and the
	// sidebar row share this fetch — no extra request.
	const details = useMastodonConnectionQuery( connection?.id ?? null );

	// Subscribe to the mastodon query cache; any auth_required error
	// invalidates auth-status so the gate refetches and re-renders.
	useMastodonAuthStatusInvalidator( connection?.id ?? null );

	// Top-level read of auth-status so this component can fire the
	// gate-shown Tracks event. The gate's adapter calls
	// `useMastodonAuthStatusQuery` against the same key, so React Query
	// dedupes — one fetch.
	const authStatus = useMastodonAuthStatusQuery( connection?.id ?? null );

	const authorize = useAuthorizeMastodonConnectionMutation();

	const gateShownConnectionId = useRef< number | null >( null );
	useEffect( () => {
		if ( ! connection ) {
			return;
		}
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
	}, [ connection?.id, authStatus.data?.needs_reauth, dispatch ] );

	useEffect( () => {
		if ( isPending ) {
			return;
		}
		if ( ! connection ) {
			page.replace( '/reader/mastodon' );
			return;
		}
		if ( ! tabValid ) {
			page.replace( `/reader/mastodon/${ connection.id }/${ TIMELINE_TAB }` );
		}
	}, [ isPending, connection, tabValid ] );

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

	const handleReconnect = () => {
		if ( ! connection || authorize.isPending ) {
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
						// landed on.
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

	if ( ! connection || ! tabValid ) {
		return (
			<ReaderMain className="mastodon-view">
				<DocumentHead title={ translate( 'Mastodon ‹ Reader' ) } />
				<div role="status" aria-live="polite">
					{ translate( 'Loading…' ) }
				</div>
			</ReaderMain>
		);
	}

	const title = details.data?.display_name || connection.display_name || connection.handle;
	const subtitle = connection.handle;

	// The compose FAB and modal sit outside <ConnectionReauthGate> (the gate
	// only wraps the tab body), so without an explicit guard they'd float
	// over the reauth prompt. Hide both while the connection needs reauth —
	// any post submitted via that path would fail with auth_required anyway.
	const hideComposer = authStatus.data?.needs_reauth === true;

	return (
		<ComposerProvider connectionId={ connection.id } config={ mastodonComposerConfig }>
			<ReaderMain className="mastodon-view">
				<DocumentHead title={ translate( '%s ‹ Mastodon ‹ Reader', { args: title } ) } />
				<NavigationHeader title={ title } subtitle={ subtitle } />
				<MastodonNavigation connectionId={ connection.id } selectedTab={ tab } />
				<VStack spacing={ 4 } className="mastodon-view__body">
					<ConnectionReauthGate
						connectionId={ connection.id }
						useAuthStatus={ useMastodonAuthStatusForGate }
						onReconnect={ handleReconnect }
						isReconnecting={ authorize.isPending }
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
						{ renderTab( tab, connection ) }
					</ConnectionReauthGate>
				</VStack>
			</ReaderMain>
			{ ! hideComposer && (
				<>
					<ComposeFab />
					<ComposerModal />
				</>
			) }
		</ComposerProvider>
	);
}

function renderTab( slug: string, connection: MastodonConnection ) {
	switch ( slug ) {
		case PROFILE_TAB:
			return <ProfilePanel connection={ connection } />;
		case SETTINGS_TAB:
			return <SettingsPanel />;
		case TIMELINE_TAB:
		default:
			return <TimelinePanel connection={ connection } />;
	}
}

export default MastodonAccountView;
