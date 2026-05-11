import { useFediverseConnectionsQuery } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import ExpandableSidebarMenu from 'calypso/layout/sidebar/expandable';
import SidebarItem from 'calypso/layout/sidebar/item';
import { ReaderFediverseIcon } from 'calypso/reader/components/icons/fediverse-icon';
import { DEFAULT_FEDIVERSE_TAB } from 'calypso/reader/fediverse/helper';
import { SocialAccountMenuItem } from 'calypso/reader/sidebar/social';
import { useDispatch } from 'calypso/state';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import ReaderSidebarHelper from '../helper';
import type { FediverseConnection } from '@automattic/api-core';

interface Props {
	path: string;
}

const BASE_PATH = '/reader/fediverse';

/**
 * Extract the numeric connection id from a path shaped like
 * `/reader/fediverse/:id(/:tab)?`. The id segment must be all digits —
 * fuzzy prefixes like `/reader/fediverse/1bogus` do not match. Returns
 * null for any path that does not match (e.g. `/reader/fediverse/connect`).
 */
function getActiveConnectionId( path: string ): number | null {
	const match = path.match( /^\/reader\/fediverse\/(\d+)(?:\/|$)/ );
	return match ? Number( match[ 1 ] ) : null;
}

/**
 * Renders a single connection row. The list endpoint already returns
 * the icon + name in the same shape as the per-id endpoint, so no lazy
 * details fetch is needed today — the row reads everything from the
 * row's own connection object.
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
	const displayName = connection.name || connection.webfinger;
	const avatarUrl = connection.icon || null;
	const href = `${ BASE_PATH }/${ connection.id }/${ DEFAULT_FEDIVERSE_TAB }`;

	return (
		<SocialAccountMenuItem
			avatarUrl={ avatarUrl }
			displayName={ displayName }
			handle={ connection.webfinger }
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

	useEffect( () => {
		if ( isOnFediverse ) {
			setIsOpen( true );
		}
	}, [ isOnFediverse ] );

	const recordClick = () => {
		dispatch( recordReaderTracksEvent( 'calypso_reader_sidebar_fediverse_clicked' ) );
	};

	const handleConnectionClick = ( id: number ) => {
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_sidebar_fediverse_connection_clicked', {
				connection_id: id,
			} )
		);
	};

	if ( ! isOnFediverse ) {
		return (
			<SidebarItem
				label={ translate( 'Fediverse' ) }
				link={ BASE_PATH }
				onNavigate={ recordClick }
				customIcon={ <ReaderFediverseIcon /> }
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
		if ( activeId === null && path !== BASE_PATH ) {
			page( BASE_PATH );
		}
	};

	return (
		<li>
			<ExpandableSidebarMenu
				expanded={ isOpen }
				title={ translate( 'Fediverse' ) }
				customIcon={ <ReaderFediverseIcon /> }
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
			</ExpandableSidebarMenu>
		</li>
	);
}

export { ReaderSidebarFediverse };
export default ReaderSidebarFediverse;
