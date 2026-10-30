import { getAdminMenu } from 'calypso/state/admin-menu/selectors';
import type { AdminMenuItem } from 'calypso/state/admin-menu/types';
import type { AppState } from 'calypso/types';

export default function isJetpackSeoPageAvailable( state: AppState, siteId: number | null ) {
	const menu: AdminMenuItem[] = getAdminMenu( state, siteId ) ?? [];
	return menu.some( ( item ) => item.children?.some( ( child ) => child.slug === 'jetpack-seo' ) );
}
