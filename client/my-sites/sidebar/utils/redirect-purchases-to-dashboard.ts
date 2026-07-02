import config from '@automattic/calypso-config';
import { getPathname } from './normalize-wpcom-admin-sidebar-host-links';
import type { AdminMenuItem } from 'calypso/state/admin-menu/types';

const PURCHASES_SUBSCRIPTIONS_PREFIX = '/purchases/subscriptions/';

function getDashboardPurchasesUrl( siteId: number ): string {
	const path = `/me/billing/purchases?site=${ siteId }`;

	if ( config( 'env' ) === 'development' ) {
		const port = config( 'port' ) ?? 3000;
		return new URL( path, `http://my.localhost:${ port }` ).href;
	}

	return new URL( path, 'https://my.wordpress.com' ).href;
}

function rewriteItem( item: AdminMenuItem, dashboardUrl: string ): AdminMenuItem {
	const rewritten: AdminMenuItem = { ...item };

	if ( getPathname( item.url )?.startsWith( PURCHASES_SUBSCRIPTIONS_PREFIX ) ) {
		rewritten.url = dashboardUrl;
	}

	if ( Array.isArray( item.children ) ) {
		rewritten.children = item.children.map( ( child ) => rewriteItem( child, dashboardUrl ) );
	}

	return rewritten;
}

/**
 * Point the site sidebar's "Purchases" link at the Dashboard purchases page
 * (pre-filtered to the current site) instead of the classic
 * `/purchases/subscriptions/:site` screen. Gated by the
 * `sidebar/purchases-dashboard-link` feature flag by the caller.
 */
export function redirectSidebarPurchasesToDashboard(
	menuItems: AdminMenuItem[],
	siteId: number | null
): AdminMenuItem[] {
	if ( ! siteId ) {
		return menuItems;
	}

	const dashboardUrl = getDashboardPurchasesUrl( siteId );
	return menuItems.map( ( item ) => rewriteItem( item, dashboardUrl ) );
}
