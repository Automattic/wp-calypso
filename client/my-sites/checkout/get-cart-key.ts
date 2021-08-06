/**
 * Internal dependencies
 */
import { SiteData } from 'calypso/state/ui/selectors/site-data';

export default function getCartKey( {
	selectedSite,
	isLoggedOutCart,
	isNoSiteCart,
}: {
	selectedSite: SiteData | undefined | null;
	isLoggedOutCart?: boolean;
	isNoSiteCart?: boolean;
} ): string | undefined {
	if ( ! selectedSite?.slug && ( isLoggedOutCart || isNoSiteCart ) ) {
		return 'no-user';
	}
	if ( ! selectedSite?.slug && ! isLoggedOutCart && ! isNoSiteCart ) {
		return 'no-site';
	}
	if ( selectedSite?.slug && ( isLoggedOutCart || isNoSiteCart ) ) {
		return selectedSite.slug;
	}
	if ( selectedSite?.ID ) {
		return String( selectedSite.ID );
	}
	return 'no-site';
}
