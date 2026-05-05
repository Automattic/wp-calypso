import { useFediverseConnectionsQuery } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { Button, __experimentalVStack as VStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import NavigationHeader from 'calypso/components/navigation-header';
import ReaderMain from 'calypso/reader/components/reader-main';
import { ComposerModal, ComposerProvider, ComposeFab } from './composer';
import { FediverseNavigation } from './fediverse-navigation';
import { PROFILE_TAB, SETTINGS_TAB, TIMELINE_TAB } from './helper';
import { ProfilePanel } from './profile-panel';
import { getLandingUrl, getAccountUrl } from './route';
import { SettingsPanel } from './settings-panel';
import { TimelinePanel } from './timeline-panel';
import type { FediverseConnection } from '@automattic/api-core';

const VALID_TABS = new Set< string >( [ TIMELINE_TAB, PROFILE_TAB, SETTINGS_TAB ] );

interface Props {
	connectionId: number;
	tab: string;
}

export function FediverseAccountView( { connectionId, tab }: Props ) {
	const translate = useTranslate();
	const { data, isPending, isError, refetch } = useFediverseConnectionsQuery();

	const connections = data?.connections ?? [];
	const connection = connections.find( ( c ) => c.id === connectionId ) ?? null;
	const tabValid = VALID_TABS.has( tab );

	useEffect( () => {
		if ( isPending || isError ) {
			return;
		}
		if ( ! connection ) {
			page.replace( getLandingUrl() );
			return;
		}
		if ( ! tabValid ) {
			page.replace( getAccountUrl( connection.id, TIMELINE_TAB ) );
		}
	}, [ isPending, isError, connection, tabValid ] );

	if ( isError ) {
		return (
			<ReaderMain className="fediverse-view">
				<DocumentHead title={ translate( 'Fediverse ‹ Reader' ) } />
				<div role="alert" className="fediverse-account-error">
					<p>{ translate( "We couldn't load your Fediverse connections." ) }</p>
					<Button variant="secondary" onClick={ () => refetch() }>
						{ translate( 'Try again' ) }
					</Button>
				</div>
			</ReaderMain>
		);
	}

	if ( ! connection || ! tabValid ) {
		return (
			<ReaderMain className="fediverse-view">
				<DocumentHead title={ translate( 'Fediverse ‹ Reader' ) } />
				<div role="status" aria-live="polite">
					{ translate( 'Loading…' ) }
				</div>
			</ReaderMain>
		);
	}

	const title = connection.handle;

	return (
		<ReaderMain className="fediverse-view">
			<DocumentHead title={ translate( '%s ‹ Fediverse ‹ Reader', { args: title } ) } />
			<NavigationHeader title={ translate( 'Fediverse' ) } subtitle={ title } />
			<FediverseNavigation connectionId={ connection.id } selectedTab={ tab } />
			<ComposerProvider connectionId={ connection.id }>
				<VStack spacing={ 4 } className="fediverse-view__body">
					{ renderTab( tab, connection ) }
				</VStack>
				<ComposerModal />
				<ComposeFab />
			</ComposerProvider>
		</ReaderMain>
	);
}

function renderTab( slug: string, connection: FediverseConnection ) {
	switch ( slug ) {
		case PROFILE_TAB:
			return (
				<ProfilePanel
					handle={ connection.handle }
					actorUrl={ connection.actor_url }
					siteHost={ connection.site_host }
				/>
			);
		case SETTINGS_TAB:
			return <SettingsPanel connectionId={ connection.id } />;
		default:
			return <TimelinePanel connectionId={ connection.id } handle={ connection.handle } />;
	}
}

export default FediverseAccountView;
