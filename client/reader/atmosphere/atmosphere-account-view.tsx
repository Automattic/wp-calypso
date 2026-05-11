import { useConnectionsQuery } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { Spinner, __experimentalVStack as VStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import NavigationHeader from 'calypso/components/navigation-header';
import { ReaderBlueskyIcon } from 'calypso/reader/components/icons/bluesky-icon';
import ReaderMain from 'calypso/reader/components/reader-main';
import { ComposeFab, ComposerModal, ComposerProvider } from 'calypso/reader/social/composer';
import { normalizeHandle } from 'calypso/reader/social/utils/normalize-handle';
import { AtmosphereNavigation } from './atmosphere-navigation';
import { atmosphereComposerConfig } from './composer-config';
import { PROFILE_TAB, TIMELINE_TAB } from './helper';
import { ProfilePanel } from './profile-panel';
import { TimelinePanel } from './timeline-panel';
import type { AtmosphereConnection } from '@automattic/api-core';

const VALID_TABS = new Set( [ TIMELINE_TAB, PROFILE_TAB ] );

interface Props {
	connectionId: number;
	tab: string;
}

export function AtmosphereAccountView( { connectionId, tab }: Props ) {
	const translate = useTranslate();
	const { data, isPending } = useConnectionsQuery();

	const connections = data?.connections ?? [];
	const connection = connections.find( ( c ) => c.id === connectionId ) ?? null;
	const tabValid = VALID_TABS.has( tab );

	useEffect( () => {
		if ( isPending ) {
			return;
		}
		if ( ! connection ) {
			page.replace( '/reader/atmosphere' );
			return;
		}
		if ( ! tabValid ) {
			page.replace( `/reader/atmosphere/${ connection.id }/${ TIMELINE_TAB }` );
		}
	}, [ isPending, connection, tabValid ] );

	if ( ! connection || ! tabValid ) {
		return (
			<ReaderMain className="atmosphere-view">
				<DocumentHead title={ translate( 'ATmosphere ‹ Reader' ) } />
				<div className="wp-spinner-wrapper" role="status" aria-live="polite">
					<Spinner />
					<p>{ translate( 'Loading…' ) }</p>
				</div>
			</ReaderMain>
		);
	}

	const documentTitle = connection.display_name || connection.handle;
	const handle = normalizeHandle( connection.handle );
	const subtitle = handle
		? translate(
				'Catch up with the latest from the people you follow on Bluesky with @%(handle)s',
				{ args: { handle } }
		  )
		: translate( 'Catch up with the latest from the people you follow on Bluesky.' );

	const title = (
		<span className="atmosphere-view__section-title">
			<span data-testid="atmosphere-section-logo" aria-hidden="true">
				<ReaderBlueskyIcon />
			</span>
			<span>ATmosphere</span>
		</span>
	);

	return (
		<ComposerProvider connectionId={ connection.id } config={ atmosphereComposerConfig }>
			<ReaderMain className="atmosphere-view">
				<DocumentHead title={ translate( '%s ‹ ATmosphere ‹ Reader', { args: documentTitle } ) } />
				<NavigationHeader title={ title } subtitle={ subtitle } />
				<AtmosphereNavigation connectionId={ connection.id } selectedTab={ tab } />
				<VStack spacing={ 4 } className="atmosphere-view__body">
					{ renderTab( tab, connection ) }
				</VStack>
			</ReaderMain>
			<ComposeFab />
			<ComposerModal />
		</ComposerProvider>
	);
}

function renderTab( slug: string, connection: AtmosphereConnection ) {
	switch ( slug ) {
		case PROFILE_TAB:
			return <ProfilePanel connection={ connection } />;
		case TIMELINE_TAB:
		default:
			return <TimelinePanel connection={ connection } />;
	}
}

export default AtmosphereAccountView;
