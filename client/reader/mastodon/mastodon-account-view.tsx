import { useMastodonConnectionQuery, useMastodonConnectionsQuery } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import NavigationHeader from 'calypso/components/navigation-header';
import ReaderMain from 'calypso/reader/components/reader-main';
import { ComposeFab, ComposerModal, ComposerProvider } from 'calypso/reader/social/composer';
import { mastodonComposerConfig } from './composer-config';
import { PROFILE_TAB, SETTINGS_TAB, TIMELINE_TAB } from './helper';
import { MastodonNavigation } from './mastodon-navigation';
import { ProfilePanel } from './profile-panel';
import { SettingsPanel } from './settings-panel';
import { TimelinePanel } from './timeline-panel';
import type { MastodonConnection } from '@automattic/api-core';

const VALID_TABS = new Set( [ TIMELINE_TAB, PROFILE_TAB, SETTINGS_TAB ] );

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

	// The list endpoint omits display_name for Mastodon connections (it comes
	// back null), so the header would otherwise fall back to the raw handle
	// for the title and duplicate it as the subtitle. The details endpoint has
	// the display name; React Query dedupes by key, so ProfilePanel and the
	// sidebar row share this fetch — no extra request.
	const details = useMastodonConnectionQuery( connection?.id ?? null );

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
					{ renderTab( tab, connection ) }
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
