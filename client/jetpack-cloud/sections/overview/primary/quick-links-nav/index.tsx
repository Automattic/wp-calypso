import { localizeUrl } from '@automattic/i18n-utils';
import { category, key, plugins, plus, receipt, store, tag } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { JETPACK_DASHBOARD_QUICK_LINKS_NAV_PREFERENCE } from 'calypso/state/jetpack-agency-dashboard/selectors';
import {
	JETPACK_MANAGE_BILLING_LINK,
	JETPACK_MANAGE_DASHBOARD_LINK,
	JETPACK_MANAGE_INVOICES_LINK,
	JETPACK_MANAGE_LICENCES_LINK,
	JETPACK_MANAGE_PLUGINS_LINK,
} from '../../../sidebar-navigation/lib/constants';
import FoldableNav from '../../foldable-nav';
import { FoldableNavItem } from '../../foldable-nav/types';

export default function QuickLinksNav() {
	const translate = useTranslate();

	const header = translate( 'Quick links' );
	const tracksName = 'calypso_jetpack_manage_overview_quick_links';

	const navItems: FoldableNavItem[] = [
		{
			icon: category,
			link: JETPACK_MANAGE_DASHBOARD_LINK,
			title: translate( 'Manage all sites' ),
		},
		{
			icon: plus,
			link: localizeUrl( 'https://wordpress.com/jetpack/connect' ),
			title: translate( 'Add sites to Jetpack Manage' ),
		},
		{
			icon: plugins,
			link: JETPACK_MANAGE_PLUGINS_LINK,
			title: translate( 'Manage plugins' ),
		},
		{
			icon: key,
			link: JETPACK_MANAGE_LICENCES_LINK,
			title: translate( 'View all licenses' ),
		},
		{
			icon: store,
			link: JETPACK_MANAGE_BILLING_LINK,
			title: translate( 'View billing' ),
		},
		{
			icon: receipt,
			link: JETPACK_MANAGE_INVOICES_LINK,
			title: translate( 'View invoices' ),
		},
		{
			icon: tag,
			link: '/partner-portal/issue-license',
			title: translate( 'View prices' ),
		},
	].map( ( props ) => ( {
		...props,
		trackEventName: 'calypso_jetpack_manage_overview_quick_links_click',
	} ) );

	return (
		<FoldableNav
			header={ header }
			navItems={ navItems }
			preferenceName={ JETPACK_DASHBOARD_QUICK_LINKS_NAV_PREFERENCE }
			tracksName={ tracksName }
		/>
	);
}
