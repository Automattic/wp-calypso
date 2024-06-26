import page from '@automattic/calypso-router';
import { chevronLeft, formatListBulletsRTL, starEmpty, category } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import NewSidebar from 'calypso/jetpack-cloud/components/sidebar';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	JETPACK_MANAGE_SITES_LINK,
	JETPACK_MANAGE_SITES_LINK_NEEDS_ATTENTION,
	JETPACK_MANAGE_SITES_LINK_FAVORITES,
	JETPACK_MANAGE_OVERVIEW_LINK,
} from './lib/constants';
import { MenuItemProps } from './types';
import './style.scss';

const SitesSidebar = ( { path }: { path: string } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const createItem = ( props: MenuItemProps ) => ( {
		...props,
		path: JETPACK_MANAGE_SITES_LINK_NEEDS_ATTENTION,
		trackEventName: 'calypso_jetpack_sidebar_menu_click',
		isSelected: props.link === path,
	} );

	const menuItems = [
		createItem( {
			id: 'sites-needs-attention-menu-item',
			icon: formatListBulletsRTL,
			path: JETPACK_MANAGE_SITES_LINK_NEEDS_ATTENTION,
			link: JETPACK_MANAGE_SITES_LINK_NEEDS_ATTENTION,
			title: translate( 'Needs Attention' ),
			trackEventProps: {
				menu_item: 'Jetpack Cloud / Sites / Needs Attention',
			},
		} ),
		createItem( {
			id: 'sites-favorites-menu-item',
			icon: starEmpty,
			path: JETPACK_MANAGE_SITES_LINK_NEEDS_ATTENTION,
			link: JETPACK_MANAGE_SITES_LINK_FAVORITES,
			title: translate( 'Favorites' ),
			trackEventProps: {
				menu_item: 'Jetpack Cloud / Sites / Favorites',
			},
		} ),
		createItem( {
			id: 'sites-all-menu-item',
			icon: category,
			path: JETPACK_MANAGE_SITES_LINK_NEEDS_ATTENTION,
			link: JETPACK_MANAGE_SITES_LINK,
			title: translate( 'All' ),
			trackEventProps: {
				menu_item: 'Jetpack Cloud / Sites / All',
			},
		} ),
	];

	return (
		<NewSidebar
			isJetpackManage
			className="sites-dashboard__sidebar"
			path={ JETPACK_MANAGE_SITES_LINK }
			menuItems={ menuItems }
			title={ translate( 'Sites' ) }
			description={ translate( 'Manage all your sites and Jetpack services from one place.' ) }
			backButtonProps={ {
				label: translate( 'Back to Overview' ),
				icon: chevronLeft,
				onClick: () => {
					dispatch( recordTracksEvent( 'calypso_jetpack_sidebar_sites_back_button_click' ) );
					page( JETPACK_MANAGE_OVERVIEW_LINK );
				},
			} }
		/>
	);
};

export default SitesSidebar;
