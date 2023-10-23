import { plugins, key, currencyDollar, category } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
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
		isSelected: isMenuItemSelected( props.link ),
	} );

	const menuItems = [
		createItem( {
			icon: category,
			path: '/',
			link: JETPACK_MANAGE_DASHBOARD_LINK,
			title: translate( 'Sites Management' ),
		} ),
		createItem( {
			icon: plugins,
			path: '/',
			link: JETPACK_MANAGE_PLUGINS_LINK,
			title: translate( 'Plugin Management' ),
		} ),
		createItem( {
			icon: key,
			path: '/',
			link: JETPACK_MANAGE_LICENCES_LINK,
			title: translate( 'Licenses' ),
		} ),
		createItem( {
			icon: currencyDollar,
			path: '/partner-portal/',
			link: JETPACK_MANAGE_BILLING_LINK,
			title: translate( 'Purchases' ),
			withChevron: true,
		} ),
	];
	return <NewSidebar isJetpackManage path="/" menuItems={ menuItems } />;
};

export default JetpackManageSidebar;
