import { plugins, key, currencyDollar, category } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import NewSidebar from 'calypso/jetpack-cloud/components/sidebar';
import { itemLinkMatches } from 'calypso/my-sites/sidebar/utils';
import {
	JETPACK_MANAGE_DASHBOARD_LINK,
	JETPACK_MANAGE_PLUGINS_LINK,
	JETPACK_MANAGE_LICENCES_LINK,
	JETPACK_MANAGE_BILLING_LINK,
} from './lib/constants';

const JetpackManageSidebar = () => {
	const translate = useTranslate();

	const onClickMenuItem = ( path: string ) => {
		page.redirect( path );
	};

	const isSelected = ( link: string ) => {
		const pathname = window.location.pathname;
		return itemLinkMatches( link, pathname );
	};

	const menuItems = [
		{
			icon: category,
			path: '/',
			link: JETPACK_MANAGE_DASHBOARD_LINK,
			title: translate( 'Sites Management' ),
			onClickMenuItem: onClickMenuItem,
			isSelected: isSelected( JETPACK_MANAGE_DASHBOARD_LINK ),
		},
		{
			icon: plugins,
			path: '/',
			link: JETPACK_MANAGE_PLUGINS_LINK,
			title: translate( 'Plugin Management' ),
			onClickMenuItem: onClickMenuItem,
			isSelected: isSelected( JETPACK_MANAGE_PLUGINS_LINK ),
		},
		{
			icon: key,
			path: '/',
			link: JETPACK_MANAGE_LICENCES_LINK,
			title: translate( 'Licenses' ),
			onClickMenuItem: onClickMenuItem,
			isSelected: isSelected( JETPACK_MANAGE_LICENCES_LINK ),
		},
		{
			icon: currencyDollar,
			path: '/partner-portal/',
			link: JETPACK_MANAGE_BILLING_LINK,
			title: translate( 'Purchases' ),
			onClickMenuItem: onClickMenuItem,
			withChevron: true,
			isSelected: isSelected( JETPACK_MANAGE_BILLING_LINK ),
		},
	];
	return <NewSidebar isJetpackManage path="/" menuItems={ menuItems } />;
};

export default JetpackManageSidebar;
