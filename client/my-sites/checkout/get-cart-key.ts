import { SiteData } from 'calypso/state/ui/selectors/site-data';
import type { CartKey } from '@automattic/shopping-cart';

export default function getCartKey( {
	selectedSite,
	isLoggedOutCart,
	isNoSiteCart,
	doesUserHavePermission,
}: {
	selectedSite: SiteData | undefined | null;
	isLoggedOutCart?: boolean;
	isNoSiteCart?: boolean;
	doesUserHavePermission?: boolean;
} ): CartKey | undefined {
	if ( ! selectedSite?.slug && ( isLoggedOutCart || isNoSiteCart ) ) {
		return 'no-user';
	}
	if ( ! selectedSite?.slug && ! isLoggedOutCart && ! isNoSiteCart ) {
		return 'no-site';
	}
	if ( selectedSite?.ID && ! doesUserHavePermission ) {
		return undefined;
	}
	if ( selectedSite?.ID ) {
		return selectedSite.ID;
	}
	return 'no-site';
}
