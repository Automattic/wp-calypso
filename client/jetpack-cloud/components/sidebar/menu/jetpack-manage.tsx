import { plugins, currencyDollar, category } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import JetpackIcons from 'calypso/components/jetpack/sidebar/menu-items/jetpack-icons';
import GuidedTour from 'calypso/jetpack-cloud/components/guided-tour';
import { SidebarNavigatorMenu, SidebarNavigatorMenuItem } from 'calypso/layout/sidebar-v2';
import { itemLinkMatches } from 'calypso/my-sites/sidebar/utils';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	JETPACK_MANAGE_DASHBOARD_LINK,
	JETPACK_MANAGE_PLUGINS_LINK,
	JETPACK_MANAGE_LICENCES_LINK,
	JETPACK_MANAGE_BILLING_LINK,
	JETPACK_MANAGE_PARTNER_PORTAL_LINK,
} from './lib/constants';
import type { MenuItemProps } from './types';

const BILLING_MENU_ITEM_ID = 'partner-portal-billing-menu-item';

const JetpackManageSidebarMenu = ( { path }: { path: string } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const createItem = ( props: MenuItemProps ) => ( {
		...props,
		trackEventName: 'calypso_jetpack_sidebar_menu_click',
		isSelected: itemLinkMatches( props.link, path ),
	} );

	const menuItems = [
		createItem( {
			icon: category,
			path: '/',
			link: JETPACK_MANAGE_DASHBOARD_LINK,
			title: translate( 'Sites' ),
			trackEventProps: {
				menu_item: 'Jetpack Cloud / Dashboard',
			},
		} ),
		createItem( {
			icon: plugins,
			path: '/',
			link: JETPACK_MANAGE_PLUGINS_LINK,
			title: translate( 'Plugins' ),
			trackEventProps: {
				menu_item: 'Jetpack Cloud / Plugins',
			},
		} ),
		createItem( {
			icon: <JetpackIcons icon="licenses_line" size={ 24 } />,
			path: '/',
			link: JETPACK_MANAGE_LICENCES_LINK,
			title: translate( 'Licenses' ),
			trackEventProps: {
				menu_item: 'Jetpack Cloud / Partner Portal / Licenses',
			},
		} ),
		createItem( {
			id: BILLING_MENU_ITEM_ID,
			icon: currencyDollar,
			path: JETPACK_MANAGE_PARTNER_PORTAL_LINK,
			link: JETPACK_MANAGE_BILLING_LINK,
			title: translate( 'Purchases' ),
			trackEventProps: {
				menu_item: 'Jetpack Cloud / Partner Portal',
			},
			withChevron: true,
		} ),
	];
	return (
		<>
			<SidebarNavigatorMenu path="/">
				{ menuItems.map( ( item ) => (
					<SidebarNavigatorMenuItem
						key={ item.link }
						{ ...item }
						onClickMenuItem={ () => {
							if ( item.trackEventName ) {
								dispatch( recordTracksEvent( item.trackEventName, item.trackEventProps ) );
							}
						} }
					/>
				) ) }
			</SidebarNavigatorMenu>

			<GuidedTour
				className="jetpack-cloud-sidebar__guided-tour"
				preferenceName="jetpack-manage-sidebar-v2-dashboard-tour"
				tours={ [
					{
						target: '.jetpack-cloud-sidebar__all-sites-icon',
						title: translate( 'Switch Sites Easily' ),
						description: translate(
							'You can navigate through your individual site views from here.'
						),
					},
					{
						target: '.jetpack-cloud-sidebar__profile-dropdown-button-icon',
						title: translate( 'Access Profile & Help Docs' ),
						description: translate(
							'Here you can log out from your account or view our help documentation.'
						),
					},
					{
						target: `#${ BILLING_MENU_ITEM_ID } svg`,
						popoverPosition: 'bottom left',
						title: translate( 'Manage Purchases' ),
						description: translate(
							'Here you can view your billing info, payment methods, invoices and more.'
						),
					},
				] }
			/>
		</>
	);
};

export default JetpackManageSidebarMenu;
