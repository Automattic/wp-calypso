import type { SiteDetails } from '@automattic/data-stores';
import type { CartKey } from '@automattic/shopping-cart';

export default function getCartKey( {
	selectedSite,
	isLoggedOutCart,
	isNoSiteCart,
}: {
	selectedSite: SiteDetails | undefined | null;
	isLoggedOutCart?: boolean;
	isNoSiteCart?: boolean;
} ): CartKey | undefined {
	if ( ! selectedSite?.slug && ( isLoggedOutCart || isNoSiteCart ) ) {
		return 'no-user';
	}
	if ( ! selectedSite?.slug && ! isLoggedOutCart && ! isNoSiteCart ) {
		return 'no-site';
	}
	if ( selectedSite?.ID ) {
		return selectedSite.ID;
	}
	return 'no-site';
}
