import { Card } from '@automattic/components';
import { category, key, receipt, store, tag, info } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import FoldableNav from 'calypso/a8c-for-agencies/components/foldable-nav';
import { FoldableNavItem } from 'calypso/a8c-for-agencies/components/foldable-nav/types';
import {
	A4A_SITES_LINK,
	A4A_MARKETPLACE_LINK,
	A4A_PURCHASES_LINK,
	A4A_BILLING_LINK,
	A4A_INVOICES_LINK,
	EXTERNAL_A4A_KNOWLEDGE_BASE,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';

import './style.scss';

export default function OverviewSidebarQuickLinks() {
	const translate = useTranslate();

	const header = translate( 'Quick links' );
	const tracksName = 'calypso_jetpack_manage_overview_quick_links';

	const navItems: FoldableNavItem[] = [
		{
			icon: category,
			link: A4A_SITES_LINK,
			slug: 'manage_sites',
			title: translate( 'Manage all sites' ),
			trackEventName: 'calypso_a4a_overview_quick_links_manage_sites_click',
		},
		{
			icon: tag,
			link: A4A_MARKETPLACE_LINK,
			slug: 'view_marketplace',
			title: translate( 'Explore the marketplace' ),
			trackEventName: 'calypso_a4a_overview_quick_links_view_marketplace_click',
		},
		{
			icon: key,
			link: A4A_PURCHASES_LINK,
			slug: 'manage_purchases',
			title: translate( 'Manage your purchases' ),
			trackEventName: 'calypso_a4a_overview_quick_links_manage_purchases_click',
		},
		{
			icon: store,
			link: A4A_BILLING_LINK,
			slug: 'view_billing',
			title: translate( 'View billing' ),
			trackEventName: 'calypso_a4a_overview_quick_links_view_billing_click',
		},
		{
			icon: receipt,
			link: A4A_INVOICES_LINK,
			slug: 'view_invoices',
			title: translate( 'View invoices' ),
			trackEventName: 'calypso_a4a_overview_quick_links_view_invoices_click',
		},
		{
			icon: info,
			link: EXTERNAL_A4A_KNOWLEDGE_BASE,
			slug: 'view_knowledge_base',
			title: translate( 'View Knowledge Base' ),
			trackEventName: 'calypso_a4a_overview_quick_links_knowledge_base_click',
			isExternalLink: true,
		},
	];

	return (
		<Card className="overview__quick-links">
			<FoldableNav header={ header } navItems={ navItems } tracksName={ tracksName } />
		</Card>
	);
}
