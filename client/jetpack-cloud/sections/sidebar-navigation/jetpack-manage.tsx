import config from '@automattic/calypso-config';
import { plugins, currencyDollar, category, home } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import JetpackIcons from 'calypso/components/jetpack/sidebar/menu-items/jetpack-icons';
import GuidedTour from 'calypso/jetpack-cloud/components/guided-tour';
import NewSidebar from 'calypso/jetpack-cloud/components/sidebar';
import { itemLinkMatches } from 'calypso/my-sites/sidebar/utils';
import {
	JETPACK_MANAGE_DASHBOARD_LINK,
	JETPACK_MANAGE_PLUGINS_LINK,
	JETPACK_MANAGE_LICENCES_LINK,
	JETPACK_MANAGE_BILLING_LINK,
	JETPACK_MANAGE_OVERVIEW_LINK,
} from './lib/constants';
import type { MenuItemProps } from './types';

const BILLING_MENU_ITEM_ID = 'partner-portal-billing-menu-item';

const JetpackManageSidebar = ( { path }: { path: string } ) => {
	const translate = useTranslate();

	const createItem = ( props: MenuItemProps ) => ( {
		...props,
		trackEventName: 'calypso_jetpack_sidebar_menu_click',
		isSelected: itemLinkMatches( props.link, path ),
	} );

	// Overview menu items. Will be only visible in development/staging environments.
	// @todo: Once the Overview page is ready for production, remove the isDevEnv check.
	const sections = config( 'sections' );
	const overviewMenuItem = createItem( {
		icon: home,
		path: '/',
		link: JETPACK_MANAGE_OVERVIEW_LINK,
		title: translate( 'Overview' ),
		trackEventProps: {
			menu_item: 'Jetpack Cloud / Overview',
		},
	} );

	const menuItems = [
		...( sections[ 'jetpack-cloud-overview' ] ? [ overviewMenuItem ] : [] ),
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
			path: '/partner-portal/',
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
			<NewSidebar isJetpackManage path="/" menuItems={ menuItems } />

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

export default JetpackManageSidebar;
