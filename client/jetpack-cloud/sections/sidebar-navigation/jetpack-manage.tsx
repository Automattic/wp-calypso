import { plugins, currencyDollar, category } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import JetpackIcons from 'calypso/components/jetpack/sidebar/menu-items/jetpack-icons';
import NewSidebar from 'calypso/jetpack-cloud/components/sidebar';
import {
	JETPACK_MANAGE_DASHBOARD_LINK,
	JETPACK_MANAGE_PLUGINS_LINK,
	JETPACK_MANAGE_LICENCES_LINK,
	JETPACK_MANAGE_BILLING_LINK,
} from './lib/constants';
import { redirectPage, isMenuItemSelected } from './lib/sidebar';
import type { MenuItemProps } from './types';

const JetpackManageSidebar = () => {
	const translate = useTranslate();

	const createItem = ( props: MenuItemProps ) => ( {
		...props,
		onClickMenuItem: redirectPage,
		trackEventName: 'calypso_jetpack_sidebar_menu_click',
		isSelected: isMenuItemSelected( props.link ),
	} );

	const menuItems = [
		createItem( {
			icon: category,
			path: '/',
			link: JETPACK_MANAGE_DASHBOARD_LINK,
			title: translate( 'Sites Management' ),
			trackEventProps: {
				menu_item: 'Jetpack Cloud / Dashboard',
			},
		} ),
		createItem( {
			icon: plugins,
			path: '/',
			link: JETPACK_MANAGE_PLUGINS_LINK,
			title: translate( 'Plugin Management' ),
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
	return <NewSidebar isJetpackManage path="/" menuItems={ menuItems } />;
};

export default JetpackManageSidebar;
