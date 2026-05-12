import {
	useConnectionsQuery,
	useFediverseConnectionsQuery,
	useMastodonConnectionsQuery,
} from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { Icon, people } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo, useState } from 'react';
import ExpandableSidebarMenu from 'calypso/layout/sidebar/expandable';
import { DEFAULT_ATMOSPHERE_TAB } from 'calypso/reader/atmosphere/helper';
import { DEFAULT_FEDIVERSE_TAB } from 'calypso/reader/fediverse/helper';
import { DEFAULT_MASTODON_TAB } from 'calypso/reader/mastodon/helper';
import { SocialAddAccountMenuItem } from 'calypso/reader/sidebar/social';
import { useDispatch } from 'calypso/state';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { ConnectionMenuItem } from './connection-menu-item';
import type { ConnectionProtocol, UnifiedConnection } from './types';
import type {
	AtmosphereConnection,
	FediverseConnection,
	MastodonConnection,
} from '@automattic/api-core';

import './style.scss';

interface Props {
	path: string;
}

const BASE_PATH = '/reader/connections';
const NEW_CONNECTION_PATH = `${ BASE_PATH }/new`;
const PROTOCOL_PATHS: Record< ConnectionProtocol, string > = {
	atmosphere: '/reader/atmosphere',
	mastodon: '/reader/mastodon',
	fediverse: '/reader/fediverse',
};

/**
 * Stable ordering when displaying connections from multiple protocols:
 * Bluesky first (largest install base today), then Mastodon, then
 * Fediverse. Within each protocol, connections sort by display name so
 * the list is predictable when users have several accounts on the same
 * protocol.
 */
const PROTOCOL_ORDER: Record< ConnectionProtocol, number > = {
	atmosphere: 0,
	mastodon: 1,
	fediverse: 2,
};

function getActiveConnection( path: string ): { protocol: ConnectionProtocol; id: number } | null {
	const match = path.match( /^\/reader\/(atmosphere|mastodon|fediverse)\/(\d+)(?:\/|$)/ );
	if ( ! match ) {
		return null;
	}
	return {
		protocol: match[ 1 ] as ConnectionProtocol,
		id: Number( match[ 2 ] ),
	};
}

function mapAtmosphere( connection: AtmosphereConnection ): UnifiedConnection {
	return {
		protocol: 'atmosphere',
		id: connection.id,
		displayName: connection.display_name || connection.handle,
		handle: `@${ connection.handle }`,
		avatarUrl: connection.avatar ?? null,
		href: `${ PROTOCOL_PATHS.atmosphere }/${ connection.id }/${ DEFAULT_ATMOSPHERE_TAB }`,
	};
}

function mapMastodon( connection: MastodonConnection ): UnifiedConnection {
	return {
		protocol: 'mastodon',
		id: connection.id,
		displayName: connection.display_name || connection.handle,
		handle: connection.handle,
		avatarUrl: connection.avatar ?? null,
		href: `${ PROTOCOL_PATHS.mastodon }/${ connection.id }/${ DEFAULT_MASTODON_TAB }`,
	};
}

function mapFediverse( connection: FediverseConnection ): UnifiedConnection {
	return {
		protocol: 'fediverse',
		id: connection.id,
		displayName: connection.name || connection.webfinger,
		handle: connection.webfinger,
		avatarUrl: connection.icon || null,
		href: `${ PROTOCOL_PATHS.fediverse }/${ connection.id }/${ DEFAULT_FEDIVERSE_TAB }`,
	};
}

function sortConnections( a: UnifiedConnection, b: UnifiedConnection ): number {
	if ( a.protocol !== b.protocol ) {
		return PROTOCOL_ORDER[ a.protocol ] - PROTOCOL_ORDER[ b.protocol ];
	}
	return a.displayName.localeCompare( b.displayName );
}

function ReaderSidebarConnections( { path }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const active = getActiveConnection( path );
	const isOnConnections =
		path.startsWith( BASE_PATH ) ||
		path.startsWith( PROTOCOL_PATHS.atmosphere ) ||
		path.startsWith( PROTOCOL_PATHS.mastodon ) ||
		path.startsWith( PROTOCOL_PATHS.fediverse );

	const [ isOpen, setIsOpen ] = useState( () => isOnConnections );

	useEffect( () => {
		if ( isOnConnections ) {
			setIsOpen( true );
		}
	}, [ isOnConnections ] );

	// All three queries gated on the menu being expanded *or* on a
	// connections route — i.e. whenever we'd actually render the rows.
	// Otherwise the user expanding the menu manually from an unrelated
	// Reader page (e.g. `/reader/search`) would see no connections at all
	// because the queries never fire. The queries don't refetch every
	// render thanks to React Query caching.
	const shouldFetch = isOnConnections || isOpen;
	const { data: atmosphereData } = useConnectionsQuery( { enabled: shouldFetch } );
	const { data: mastodonData } = useMastodonConnectionsQuery( { enabled: shouldFetch } );
	const { data: fediverseData } = useFediverseConnectionsQuery( { enabled: shouldFetch } );

	const connections = useMemo( () => {
		const all: UnifiedConnection[] = [
			...( atmosphereData?.connections ?? [] ).map( mapAtmosphere ),
			...( mastodonData?.connections ?? [] ).map( mapMastodon ),
			...( fediverseData?.connections ?? [] ).map( mapFediverse ),
		];
		return all.sort( sortConnections );
	}, [ atmosphereData, mastodonData, fediverseData ] );

	const recordHeaderClick = () => {
		dispatch( recordReaderTracksEvent( 'calypso_reader_sidebar_connections_clicked' ) );
	};

	const recordConnectionClick = ( connection: UnifiedConnection ) => {
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_sidebar_connections_account_clicked', {
				protocol: connection.protocol,
				connection_id: connection.id,
			} )
		);
	};

	const recordAddAccountClick = () => {
		dispatch( recordReaderTracksEvent( 'calypso_reader_sidebar_connections_add_account_clicked' ) );
	};

	const handleMainClick = () => {
		recordHeaderClick();
		if ( ! isOpen ) {
			setIsOpen( true );
		}
		// Don't fight the user when they're already inside a specific
		// connection's pages — clicking the header just opens the menu.
		// When they're not on any connection, navigate to the unified
		// landing route which decides between first-connection redirect
		// or the chooser.
		if ( active === null && path !== BASE_PATH ) {
			page( BASE_PATH );
		}
	};

	return (
		<li>
			<ExpandableSidebarMenu
				expanded={ isOpen }
				title={ translate( 'Social accounts' ) }
				customIcon={ <Icon className="sidebar__menu-icon" icon={ people } /> }
				onClick={ handleMainClick }
				expandableIconClick={ () => setIsOpen( ! isOpen ) }
				disableFlyout
				className={ ! isOpen ? 'sidebar__menu--selected' : undefined }
				count={ undefined }
				icon={ null }
				materialIcon={ null }
				materialIconStyle={ null }
			>
				{ connections.map( ( connection ) => (
					<ConnectionMenuItem
						key={ `${ connection.protocol }-${ connection.id }` }
						connection={ connection }
						isSelected={ active?.protocol === connection.protocol && active.id === connection.id }
						onClick={ () => recordConnectionClick( connection ) }
					/>
				) ) }
				<SocialAddAccountMenuItem
					label={ translate( 'Add account' ) }
					href={ NEW_CONNECTION_PATH }
					onClick={ recordAddAccountClick }
				/>
			</ExpandableSidebarMenu>
		</li>
	);
}

export { ReaderSidebarConnections };
export default ReaderSidebarConnections;
