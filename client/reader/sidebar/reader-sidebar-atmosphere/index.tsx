import { useConnectionQuery, useConnectionsQuery } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import ExpandableSidebarMenu from 'calypso/layout/sidebar/expandable';
import SidebarItem from 'calypso/layout/sidebar/item';
import { DEFAULT_ATMOSPHERE_TAB } from 'calypso/reader/atmosphere/helper';
import ReaderBlueskyIcon from 'calypso/reader/components/icons/bluesky-icon';
import { SocialAccountMenuItem, SocialAddAccountMenuItem } from 'calypso/reader/sidebar/social';
import { useDispatch } from 'calypso/state';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import ReaderSidebarHelper from '../helper';
import type { AtmosphereConnection } from '@automattic/api-core';

interface Props {
	path: string;
}

const BASE_PATH = '/reader/atmosphere';
const CONNECT_PATH = `${ BASE_PATH }/connect`;

/**
 * Extract the numeric connection id from a path shaped like
 * `/reader/atmosphere/:id(/:tab)?`. Returns null for paths that do not match
 * (e.g. `/reader/atmosphere`, `/reader/atmosphere/connect`, or any non-atmosphere path).
 */
function getActiveConnectionId( path: string ): number | null {
	if ( ! path.startsWith( `${ BASE_PATH }/` ) ) {
		return null;
	}
	const rest = path.slice( BASE_PATH.length + 1 ).split( '/' )[ 0 ];
	const n = Number.parseInt( rest, 10 );
	return Number.isFinite( n ) && n > 0 ? n : null;
}

/**
 * Renders a single connection row. Fetches per-connection details (display
 * name + avatar) lazily; while loading, falls back to values from the
 * connections list (which carries handle and display_name but avatar=null).
 */
function AtmosphereSidebarRow( {
	connection,
	isSelected,
	onClick,
}: {
	connection: AtmosphereConnection;
	isSelected: boolean;
	onClick: () => void;
} ) {
	const { data } = useConnectionQuery( connection.id );
	const displayName = data?.display_name || connection.display_name || connection.handle;
	const avatarUrl = data?.avatar ?? connection.avatar ?? null;
	const href = `${ BASE_PATH }/${ connection.id }/${ DEFAULT_ATMOSPHERE_TAB }`;

	return (
		<SocialAccountMenuItem
			avatarUrl={ avatarUrl }
			displayName={ displayName }
			handle={ connection.handle }
			href={ href }
			isSelected={ isSelected }
			onClick={ onClick }
		/>
	);
}

export function ReaderSidebarAtmosphere( { path }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const isOnAtmosphere = path.startsWith( BASE_PATH );
	const [ isOpen, setIsOpen ] = useState( () => isOnAtmosphere );

	// Only fetch connections on atmosphere routes. On other Reader pages we
	// render a flat link (no sub-items), so there's no need to hit the endpoint.
	const { data } = useConnectionsQuery( { enabled: isOnAtmosphere } );
	const connections = data?.connections ?? [];
	const activeId = getActiveConnectionId( path );

	// Auto-open when navigating into an atmosphere sub-route. We only ever open
	// here — collapsing on navigate-away would fight the user's explicit toggle.
	useEffect( () => {
		if ( isOnAtmosphere ) {
			setIsOpen( true );
		}
	}, [ isOnAtmosphere ] );

	const recordClick = () => {
		dispatch( recordReaderTracksEvent( 'calypso_reader_sidebar_atmosphere_clicked' ) );
	};

	const handleAddAccountClick = () => {
		dispatch( recordReaderTracksEvent( 'calypso_reader_sidebar_atmosphere_add_account_clicked' ) );
	};

	const handleConnectionClick = ( id: number ) => {
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_sidebar_atmosphere_connection_clicked', {
				connection_id: id,
			} )
		);
	};

	// Off-atmosphere paths: flat link, no expansion.
	if ( ! isOnAtmosphere ) {
		return (
			<SidebarItem
				label={ translate( 'ATmosphere' ) }
				link={ BASE_PATH }
				onNavigate={ recordClick }
				customIcon={ <ReaderBlueskyIcon /> }
				className={ ReaderSidebarHelper.itemLinkClass( BASE_PATH, path, {
					'sidebar-streams__atmosphere': true,
				} ) }
			/>
		);
	}

	const handleMainClick = () => {
		recordClick();
		if ( ! isOpen ) {
			setIsOpen( true );
		}
		// Main label navigates back to the atmosphere root — the controller
		// redirects to the default tab for the active connection.
		if ( path !== BASE_PATH ) {
			page( BASE_PATH );
		}
	};

	return (
		<li>
			<ExpandableSidebarMenu
				expanded={ isOpen }
				title={ translate( 'ATmosphere' ) }
				customIcon={ <ReaderBlueskyIcon /> }
				onClick={ handleMainClick }
				expandableIconClick={ () => setIsOpen( ! isOpen ) }
				disableFlyout
				className={ isOnAtmosphere ? 'sidebar__menu--selected' : undefined }
			>
				{ connections.map( ( connection ) => (
					<AtmosphereSidebarRow
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

export default ReaderSidebarAtmosphere;
