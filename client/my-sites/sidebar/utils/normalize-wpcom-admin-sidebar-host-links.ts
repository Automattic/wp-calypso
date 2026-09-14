import type { AdminMenuItem } from 'calypso/state/admin-menu/types';

const WPCOM_HOST_ROUTE_PREFIXES = [
	'/home/',
	'/overview/',
	'/plugins/',
	'/plans/',
	'/add-ons/',
	'/email/',
	'/domains/manage/',
	'/purchases/subscriptions/',
];

function getPathname( url: unknown ): string | null {
	if ( typeof url !== 'string' || url.trim() === '' ) {
		return null;
	}

	const value = url.trim();
	if ( value.startsWith( '/' ) ) {
		return value;
	}

	try {
		return new URL( value ).pathname;
	} catch {
		return null;
	}
}

export function isWpcomAdminSidebarHostLink( item: AdminMenuItem | null | undefined ): boolean {
	if ( ! item ) {
		return false;
	}

	const itemId = typeof item.itemId === 'string' ? item.itemId : '';
	if ( itemId.endsWith( ':paid-upgrades.php' ) ) {
		return true;
	}

	const pathname = getPathname( item.url );
	if ( ! pathname ) {
		return false;
	}

	return WPCOM_HOST_ROUTE_PREFIXES.some( ( prefix ) => pathname.startsWith( prefix ) );
}

export function normalizeWpcomAdminSidebarHostLinks(
	menuItems: readonly AdminMenuItem[] | null | undefined
): AdminMenuItem[] {
	if ( ! Array.isArray( menuItems ) ) {
		return [];
	}

	let changed = false;
	const normalized = menuItems.map( ( item ) => {
		if ( ! isWpcomAdminSidebarHostLink( item ) ) {
			return item;
		}

		const children = Array.isArray( item.children )
			? normalizeWpcomAdminSidebarHostLinks( item.children )
			: item.children;

		if ( item.group_id === null && item.reassignable === false && children === item.children ) {
			return item;
		}

		changed = true;
		return {
			...item,
			children,
			group_id: null,
			reassignable: false,
		};
	} );

	return changed ? normalized : menuItems.slice();
}
