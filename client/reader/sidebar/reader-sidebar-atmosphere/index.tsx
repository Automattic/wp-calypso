import { useConnectionsQuery } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import ExpandableSidebarMenu from 'calypso/layout/sidebar/expandable';
import SidebarItem from 'calypso/layout/sidebar/item';
import { PROFILE_TAB, SETTINGS_TAB, TIMELINE_TAB } from 'calypso/reader/atmosphere/helper';
import ReaderBlueskyIcon from 'calypso/reader/components/icons/bluesky-icon';
import { useDispatch } from 'calypso/state';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import ReaderSidebarHelper from '../helper';
import { MenuItem, MenuItemLink } from '../menu';

interface Props {
	path: string;
}

const BASE_PATH = '/reader/atmosphere';
const TIMELINE_PATH = `${ BASE_PATH }/${ TIMELINE_TAB }`;

export function ReaderSidebarAtmosphere( { path }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const { data } = useConnectionsQuery();
	const connections = data?.connections ?? [];
	const hasConnections = connections.length > 0;

	const [ isOpen, setIsOpen ] = useState( () => path.startsWith( BASE_PATH ) );

	// Auto-open when navigating into an atmosphere sub-route. We only ever open
	// here — collapsing on navigate-away would fight the user's explicit toggle.
	useEffect( () => {
		if ( path.startsWith( BASE_PATH ) ) {
			setIsOpen( true );
		}
	}, [ path ] );

	const recordClick = () => {
		dispatch( recordReaderTracksEvent( 'calypso_reader_sidebar_atmosphere_clicked' ) );
	};

	if ( ! hasConnections ) {
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

	const subItems = [
		{
			slug: TIMELINE_TAB,
			label: translate( 'Timeline' ),
			href: `${ BASE_PATH }/${ TIMELINE_TAB }`,
		},
		{ slug: PROFILE_TAB, label: translate( 'Profile' ), href: `${ BASE_PATH }/${ PROFILE_TAB }` },
		{
			slug: SETTINGS_TAB,
			label: translate( 'Settings' ),
			href: `${ BASE_PATH }/${ SETTINGS_TAB }`,
		},
	];

	const handleMainClick = () => {
		recordClick();
		if ( ! isOpen ) {
			setIsOpen( true );
		}
		// Main label always navigates to Timeline — but skip if we're already
		// there, to avoid pushing a duplicate history entry.
		if ( path !== TIMELINE_PATH ) {
			page( TIMELINE_PATH );
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
				className={ path.startsWith( BASE_PATH ) ? 'sidebar__menu--selected' : undefined }
			>
				{ subItems.map( ( item ) => (
					<MenuItem key={ item.slug } selected={ path === item.href }>
						<MenuItemLink className="sidebar__menu-link" href={ item.href }>
							<div className="sidebar__menu-item-title">{ item.label }</div>
						</MenuItemLink>
					</MenuItem>
				) ) }
			</ExpandableSidebarMenu>
		</li>
	);
}

export default ReaderSidebarAtmosphere;
