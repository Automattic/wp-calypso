import './style.scss';

import { useConnectionsQuery, useCreateConnectionMutation } from '@automattic/api-queries';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import NavigationHeader from 'calypso/components/navigation-header';
import ReaderMain from 'calypso/reader/components/reader-main';
import { AtmosphereNavigation } from './atmosphere-navigation';
import { ConnectForm } from './connect-form';
import { DEFAULT_ATMOSPHERE_TAB, PROFILE_TAB, SETTINGS_TAB, TIMELINE_TAB } from './helper';
import { ProfilePanel } from './profile-panel';
import { SettingsPanel } from './settings-panel';
import { TimelinePanel } from './timeline-panel';
import type { AtmosphereConnection } from '@automattic/api-core';

export function AtmosphereView( {
	selectedTab = DEFAULT_ATMOSPHERE_TAB,
}: { selectedTab?: string } = {} ) {
	const translate = useTranslate();
	const connections = useConnectionsQuery();
	const create = useCreateConnectionMutation();

	const title = translate( 'ATmosphere' );
	const documentTitle = translate( '%s ‹ Reader', {
		args: title,
		comment: '%s is the section name. For example: "ATmosphere"',
	} );

	const list = connections.data?.connections ?? [];
	// TODO: multi-account switcher. For now, always use the first connection.
	const active = list[ 0 ] ?? null;

	return (
		<ReaderMain className="atmosphere-view">
			<DocumentHead title={ documentTitle } />
			<NavigationHeader
				title={ title }
				subtitle={ translate( 'Connect your Bluesky account to bring it into the Reader.' ) }
			/>
			{ active ? (
				<>
					<AtmosphereNavigation selectedTab={ selectedTab } />
					<VStack spacing={ 4 } className="atmosphere-view__body">
						{ renderTab( selectedTab, active ) }
					</VStack>
				</>
			) : (
				<VStack spacing={ 4 } className="atmosphere-view__body">
					<ConnectForm
						isSubmitting={ create.isPending }
						error={ create.error ?? null }
						onSubmit={ ( values ) => create.mutate( values ) }
					/>
				</VStack>
			) }
		</ReaderMain>
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
			return <TimelinePanel />;
	}
}

export default AtmosphereView;
