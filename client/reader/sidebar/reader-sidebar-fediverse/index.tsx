import { useFediverseConnectionsQuery } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { Icon, globe } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import ExpandableSidebarMenu from 'calypso/layout/sidebar/expandable';
import SidebarItem from 'calypso/layout/sidebar/item';
import { TIMELINE_TAB } from 'calypso/reader/fediverse/helper';
import { SocialAccountMenuItem, SocialAddAccountMenuItem } from 'calypso/reader/sidebar/social';
import { useDispatch } from 'calypso/state';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import ReaderSidebarHelper from '../helper';
import type { FediverseConnection } from '@automattic/api-core';

interface Props {
	path: string;
}

const BASE_PATH = '/reader/fediverse';
const CONNECT_PATH = `${ BASE_PATH }/connect`;

/**
 * Extract the numeric connection id from a path shaped like
 * `/reader/fediverse/:id(/:tab)?`. The id segment must be all digits —
 * fuzzy prefixes like `/reader/fediverse/1bogus` do not match. Returns null
 * for any path that does not match (e.g. `/reader/fediverse/connect`).
 */
function getActiveConnectionId( path: string ): number | null {
	const match = path.match( /^\/reader\/fediverse\/(\d+)(?:\/|$)/ );
	return match ? Number( match[ 1 ] ) : null;
}

/**
 * Renders a single connection row. The Fediverse connections list endpoint
 * returns full details (handle + avatar), so no per-connection detail fetch
 * is needed.
 */
function FediverseSidebarRow( {
	connection,
	isSelected,
	onClick,
}: {
	connection: FediverseConnection;
	isSelected: boolean;
	onClick: () => void;
} ) {
	const href = `${ BASE_PATH }/${ connection.id }/${ TIMELINE_TAB }`;
	return (
		<SocialAccountMenuItem
			avatarUrl={ connection.avatar || null }
			displayName={ connection.handle }
			handle={ connection.handle }
			href={ href }
			isSelected={ isSelected }
			onClick={ onClick }
		/>
	);
}

function ReaderSidebarFediverse( { path }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const isOnFediverse = path.startsWith( BASE_PATH );
	const [ isOpen, setIsOpen ] = useState( () => isOnFediverse );

	// Only fetch connections on fediverse routes. On other Reader pages we
	// render a flat link (no sub-items), so there's no need to hit the endpoint.
	const { data } = useFediverseConnectionsQuery( { enabled: isOnFediverse } );
	const connections = data?.connections ?? [];
	const activeId = getActiveConnectionId( path );

	// Auto-open when navigating into a fediverse sub-route. We only ever open
	// here — collapsing on navigate-away would fight the user's explicit toggle.
	useEffect( () => {
		if ( isOnFediverse ) {
			setIsOpen( true );
		}
	}, [ isOnFediverse ] );

	const recordClick = () => {
		dispatch( recordReaderTracksEvent( 'calypso_reader_sidebar_fediverse_clicked' ) );
	};

	const handleAddAccountClick = () => {
		dispatch( recordReaderTracksEvent( 'calypso_reader_sidebar_fediverse_add_account_clicked' ) );
	};

	const handleConnectionClick = ( id: number ) => {
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_sidebar_fediverse_connection_clicked', {
				connection_id: id,
			} )
		);
	};

	// Off-fediverse paths: flat link, no expansion.
	if ( ! isOnFediverse ) {
		return (
			<SidebarItem
				label={ translate( 'Fediverse' ) }
				link={ BASE_PATH }
				onNavigate={ recordClick }
				customIcon={ <Icon icon={ globe } size={ 24 } /> }
				className={ ReaderSidebarHelper.itemLinkClass( BASE_PATH, path, {
					'sidebar-streams__fediverse': true,
				} ) }
			/>
		);
	}

	const handleMainClick = () => {
		recordClick();
		if ( ! isOpen ) {
			setIsOpen( true );
		}
		// From a specific connection page, stay put — otherwise the landing
		// controller would redirect us to the *first* connection's timeline,
		// which may not be the one the user is currently viewing.
		if ( activeId === null && path !== BASE_PATH ) {
			page( BASE_PATH );
		}
	};

	return (
		<li>
			<ExpandableSidebarMenu
				expanded={ isOpen }
				title={ translate( 'Fediverse' ) }
				customIcon={ <Icon icon={ globe } size={ 24 } /> }
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
					<FediverseSidebarRow
						key={ connection.id }
						connection={ connection }
						isSelected={ connection.id === activeId }
						onClick={ () => handleConnectionClick( connection.id ) }
					/>
				) ) }
				<SocialAddAccountMenuItem
					label={ translate( 'Add account' ) }
					href={ CONNECT_PATH }
					onClick={ handleAddAccountClick }
				/>
			</ExpandableSidebarMenu>
		</li>
	);
}

export { ReaderSidebarFediverse };
export default ReaderSidebarFediverse;
