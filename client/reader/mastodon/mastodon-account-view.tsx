import { useMastodonConnectionQuery, useMastodonConnectionsQuery } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { Spinner, __experimentalVStack as VStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import NavigationHeader from 'calypso/components/navigation-header';
import { ReaderMastodonIcon } from 'calypso/reader/components/icons/mastodon-icon';
import ReaderMain from 'calypso/reader/components/reader-main';
import { ComposeFab, ComposerModal, ComposerProvider } from 'calypso/reader/social/composer';
import { normalizeHandle } from 'calypso/reader/social/utils/normalize-handle';
import { mastodonComposerConfig } from './composer-config';
import { PROFILE_TAB, TIMELINE_TAB } from './helper';
import { MastodonNavigation } from './mastodon-navigation';
import { ProfilePanel } from './profile-panel';
import { TimelinePanel } from './timeline-panel';
import { MastodonReauthGate, useMastodonReauthGateState } from './use-mastodon-reauth-gate';
import type { MastodonConnection } from '@automattic/api-core';

const VALID_TABS = new Set( [ TIMELINE_TAB, PROFILE_TAB ] );

interface Props {
	connectionId: number;
	tab: string;
}

export function MastodonAccountView( { connectionId, tab }: Props ) {
	const translate = useTranslate();
	const { data, isPending } = useMastodonConnectionsQuery();

	const connections = data?.connections ?? [];
	const connection = connections.find( ( c ) => c.id === connectionId ) ?? null;
	const tabValid = VALID_TABS.has( tab );

	// The list endpoint omits display_name for Mastodon connections (it
	// comes back null), so the browser tab title would otherwise fall
	// back to the raw handle. The details endpoint has the display name;
	// React Query dedupes by key, so ProfilePanel and the sidebar row
	// share this fetch — no extra request.
	const details = useMastodonConnectionQuery( connection?.id ?? null );

	// The compose FAB and modal sit outside <ConnectionReauthGate>, so without
	// an explicit guard they'd float over the reauth prompt. Hide both while
	// the connection needs reauth — any post submitted via that path would
	// fail with auth_required anyway.
	const { needsReauth } = useMastodonReauthGateState( connection?.id ?? null );

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

	if ( ! connection || ! tabValid ) {
		return (
			<ReaderMain className="mastodon-view">
				<DocumentHead title={ translate( 'Mastodon ‹ Reader' ) } />
				<div className="wp-spinner-wrapper" role="status" aria-live="polite">
					<Spinner />
					<p>{ translate( 'Loading…' ) }</p>
				</div>
			</ReaderMain>
		);
	}

	const documentTitle = details.data?.display_name || connection.display_name || connection.handle;
	const handle = normalizeHandle( connection.handle );
	const subtitle = handle
		? translate(
				'Catch up with the latest from the people you follow on Mastodon with @%(handle)s',
				{ args: { handle } }
		  )
		: translate( 'Catch up with the latest from the people you follow on Mastodon.' );

	const title = (
		<span className="mastodon-view__section-title">
			<span data-testid="mastodon-section-logo" aria-hidden="true">
				<ReaderMastodonIcon />
			</span>
			<span>Mastodon</span>
		</span>
	);

	return (
		<ComposerProvider connectionId={ connection.id } config={ mastodonComposerConfig }>
			<ReaderMain className="mastodon-view">
				<DocumentHead title={ translate( '%s ‹ Mastodon ‹ Reader', { args: documentTitle } ) } />
				<NavigationHeader title={ title } subtitle={ subtitle } />
				<MastodonNavigation connectionId={ connection.id } selectedTab={ tab } />
				<VStack spacing={ 4 } className="mastodon-view__body">
					<MastodonReauthGate connection={ connection }>
						{ renderTab( tab, connection ) }
					</MastodonReauthGate>
				</VStack>
			</ReaderMain>
			{ ! needsReauth && (
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
		case TIMELINE_TAB:
		default:
			return <TimelinePanel connection={ connection } />;
	}
}

export default MastodonAccountView;
