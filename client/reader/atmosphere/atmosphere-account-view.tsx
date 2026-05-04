import { useConnectionsQuery } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import NavigationHeader from 'calypso/components/navigation-header';
import ReaderMain from 'calypso/reader/components/reader-main';
import { AtmosphereNavigation } from './atmosphere-navigation';
import { ComposerModal, ComposerProvider } from './composer';
import { PROFILE_TAB, SETTINGS_TAB, TIMELINE_TAB } from './helper';
import { ProfilePanel } from './profile-panel';
import { SettingsPanel } from './settings-panel';
import { TimelinePanel } from './timeline-panel';
import type { AtmosphereConnection } from '@automattic/api-core';

const VALID_TABS = new Set( [ TIMELINE_TAB, PROFILE_TAB, SETTINGS_TAB ] );

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
				<div role="status" aria-live="polite">
					{ translate( 'Loading…' ) }
				</div>
			</ReaderMain>
		);
	}

	const title = connection.display_name || connection.handle;

	return (
		<ComposerProvider connectionId={ connection.id }>
			<ReaderMain className="atmosphere-view">
				<DocumentHead title={ translate( '%s ‹ ATmosphere ‹ Reader', { args: title } ) } />
				<NavigationHeader title={ title } subtitle={ `@${ connection.handle }` } />
				<AtmosphereNavigation connectionId={ connection.id } selectedTab={ tab } />
				<VStack spacing={ 4 } className="atmosphere-view__body">
					{ renderTab( tab, connection ) }
				</VStack>
			</ReaderMain>
			<ComposerModal />
		</ComposerProvider>
	);
}

function renderTab( slug: string, connection: AtmosphereConnection ) {
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

export default AtmosphereAccountView;
