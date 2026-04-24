import { useMastodonConnectionQuery, useMastodonConnectionsQuery } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import ExpandableSidebarMenu from 'calypso/layout/sidebar/expandable';
import SidebarItem from 'calypso/layout/sidebar/item';
import { ReaderMastodonIcon } from 'calypso/reader/components/icons/mastodon-icon';
import { DEFAULT_MASTODON_TAB } from 'calypso/reader/mastodon/helper';
import { SocialAccountMenuItem, SocialAddAccountMenuItem } from 'calypso/reader/sidebar/social';
import { useDispatch } from 'calypso/state';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import ReaderSidebarHelper from '../helper';
import type { MastodonConnection } from '@automattic/api-core';

interface Props {
	path: string;
}

const BASE_PATH = '/reader/mastodon';
const CONNECT_PATH = `${ BASE_PATH }/connect`;

/**
 * Extract the numeric connection id from a path shaped like
 * `/reader/mastodon/:id(/:tab)?`. The id segment must be all digits —
 * fuzzy prefixes like `/reader/mastodon/1bogus` do not match. Returns null
 * for any path that does not match (e.g. `/reader/mastodon/connect`).
 */
function getActiveConnectionId( path: string ): number | null {
	const match = path.match( /^\/reader\/mastodon\/(\d+)(?:\/|$)/ );
	return match ? Number( match[ 1 ] ) : null;
}

/**
 * Renders a single connection row. Fetches per-connection details (display
 * name + avatar) lazily; while loading, falls back to handle and display_name
 * from the connections list (the list endpoint currently omits avatar).
 */
function MastodonSidebarRow( {
	connection,
	isSelected,
	onClick,
}: {
	connection: MastodonConnection;
	isSelected: boolean;
	onClick: () => void;
} ) {
	const { data } = useMastodonConnectionQuery( connection.id );
	const displayName = data?.display_name || connection.display_name || connection.handle;
	const avatarUrl = data?.avatar ?? connection.avatar ?? null;
	const href = `${ BASE_PATH }/${ connection.id }/${ DEFAULT_MASTODON_TAB }`;

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

function ReaderSidebarMastodon( { path }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const isOnMastodon = path.startsWith( BASE_PATH );
	const [ isOpen, setIsOpen ] = useState( () => isOnMastodon );

	// Only fetch connections on mastodon routes. On other Reader pages we
	// render a flat link (no sub-items), so there's no need to hit the endpoint.
	const { data } = useMastodonConnectionsQuery( { enabled: isOnMastodon } );
	const connections = data?.connections ?? [];
	const activeId = getActiveConnectionId( path );

	// Auto-open when navigating into a mastodon sub-route. We only ever open
	// here — collapsing on navigate-away would fight the user's explicit toggle.
	useEffect( () => {
		if ( isOnMastodon ) {
			setIsOpen( true );
		}
	}, [ isOnMastodon ] );

	const recordClick = () => {
		dispatch( recordReaderTracksEvent( 'calypso_reader_sidebar_mastodon_clicked' ) );
	};

	const handleAddAccountClick = () => {
		dispatch( recordReaderTracksEvent( 'calypso_reader_sidebar_mastodon_add_account_clicked' ) );
	};

	const handleConnectionClick = ( id: number ) => {
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_sidebar_mastodon_connection_clicked', {
				connection_id: id,
			} )
		);
	};

	// Off-mastodon paths: flat link, no expansion.
	if ( ! isOnMastodon ) {
		return (
			<SidebarItem
				label={ translate( 'Mastodon' ) }
				link={ BASE_PATH }
				onNavigate={ recordClick }
				customIcon={ <ReaderMastodonIcon /> }
				className={ ReaderSidebarHelper.itemLinkClass( BASE_PATH, path, {
					'sidebar-streams__mastodon': true,
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
				title={ translate( 'Mastodon' ) }
				customIcon={ <ReaderMastodonIcon /> }
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
					<MastodonSidebarRow
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

export { ReaderSidebarMastodon };
export default ReaderSidebarMastodon;
