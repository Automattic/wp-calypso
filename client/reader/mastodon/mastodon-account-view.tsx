import {
	useMastodonAuthStatusQuery,
	useMastodonConnectionQuery,
	useMastodonConnectionsQuery,
} from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import NavigationHeader from 'calypso/components/navigation-header';
import ReaderMain from 'calypso/reader/components/reader-main';
import { ConnectionReauthGate } from 'calypso/reader/social';
import { ComposeFab, ComposerModal, ComposerProvider } from 'calypso/reader/social/composer';
import { useDispatch } from 'calypso/state';
import { successNotice } from 'calypso/state/notices/actions';
import { buildMastodonReconnectUrl } from './build-mastodon-reconnect-url';
import { mastodonComposerConfig } from './composer-config';
import { PROFILE_TAB, SETTINGS_TAB, TIMELINE_TAB } from './helper';
import { MastodonNavigation } from './mastodon-navigation';
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
// `useAuthStatus` contract. Keep this as a named function (not an inline
// arrow) — react-hooks/rules-of-hooks flags inline hooks-as-props.
function useMastodonAuthStatusForGate( connectionId: number ) {
	const r = useMastodonAuthStatusQuery( connectionId );
	return { needsReauth: r.data?.needs_reauth, isLoading: r.isPending };
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

	// Subscribe to the mastodon query/mutation caches; any auth_required
	// error invalidates auth-status so the gate refetches and re-renders.
	useMastodonAuthStatusInvalidator( connection?.id ?? 0 );

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

	// On landing back from the OAuth reconnect flow, fire a success notice
	// and strip ?reconnected={id} from the URL so a refresh doesn't re-fire.
	useEffect( () => {
		if ( ! connection ) {
			return;
		}
		const params = new URLSearchParams( window.location.search );
		if ( params.get( 'reconnected' ) !== String( connection.id ) ) {
			return;
		}
		dispatch(
			successNotice( translate( '%s reconnected', { args: connection.handle } ), {
				duration: 5000,
			} )
		);
		params.delete( 'reconnected' );
		const search = params.toString();
		const next = `${ window.location.pathname }${ search ? '?' + search : '' }`;
		window.history.replaceState( null, '', next );
		// connection.id is the load-bearing identity here; ignore translate /
		// dispatch / handle churn so the toast fires exactly once per landing.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ connection?.id ] );

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
						reconnectUrl={ buildMastodonReconnectUrl(
							connection.id,
							window.location.pathname + window.location.search
						) }
						headline={ translate( 'Reconnect to update permissions' ) as string }
						body={ createInterpolateElement(
							translate(
								'Your <strong>%s</strong> connection needs to be refreshed to keep working with new Reader features.',
								{ args: connection.handle }
							) as string,
							{ strong: <strong /> }
						) }
						buttonLabel={ translate( 'Reconnect on %s', { args: connection.instance } ) as string }
					>
						{ renderTab( tab, connection ) }
					</ConnectionReauthGate>
				</VStack>
			</ReaderMain>
			<ComposeFab />
			<ComposerModal />
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
