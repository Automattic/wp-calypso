import { useFediverseConnectionsQuery } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { Spinner, __experimentalVStack as VStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import NavigationHeader from 'calypso/components/navigation-header';
import ReaderMain from 'calypso/reader/components/reader-main';
import { FediverseNavigation } from './fediverse-navigation';
import { PROFILE_TAB, TIMELINE_TAB } from './helper';
import { ProfilePanel } from './profile-panel';
import { TimelinePanel } from './timeline-panel';

const VALID_TABS = new Set< string >( [ TIMELINE_TAB, PROFILE_TAB ] );

interface Props {
	connectionId: number;
	tab: string;
}

export function FediverseAccountView( { connectionId, tab }: Props ) {
	const translate = useTranslate();
	const { data, isPending } = useFediverseConnectionsQuery();

	const connections = data?.connections ?? [];
	const connection = connections.find( ( c ) => c.id === connectionId ) ?? null;
	const tabValid = VALID_TABS.has( tab );

	useEffect( () => {
		if ( isPending ) {
			return;
		}
		if ( ! connection ) {
			page.replace( '/reader/fediverse' );
			return;
		}
		if ( ! tabValid ) {
			page.replace( `/reader/fediverse/${ connection.id }/${ TIMELINE_TAB }` );
		}
	}, [ isPending, connection, tabValid ] );

	if ( ! connection || ! tabValid ) {
		return (
			<ReaderMain className="fediverse-view">
				<DocumentHead title={ translate( 'Fediverse ‹ Reader' ) } />
				<div className="wp-spinner-wrapper" role="status" aria-live="polite">
					<Spinner />
					<p>{ translate( 'Loading…' ) }</p>
				</div>
			</ReaderMain>
		);
	}

	const title = connection.name?.trim() || connection.webfinger;

	return (
		<ReaderMain className="fediverse-view">
			<DocumentHead
				title={
					translate( '%(handle)s ‹ Fediverse ‹ Reader', {
						args: { handle: connection.webfinger },
					} ) as string
				}
			/>
			<VStack spacing={ 4 }>
				<NavigationHeader title={ title } subtitle={ connection.webfinger } compactBreadcrumb />
				<FediverseNavigation connectionId={ connection.id } selectedTab={ tab } />
				{ tab === TIMELINE_TAB && <TimelinePanel connection={ connection } /> }
				{ tab === PROFILE_TAB && <ProfilePanel connection={ connection } /> }
			</VStack>
		</ReaderMain>
	);
}

export default FediverseAccountView;
