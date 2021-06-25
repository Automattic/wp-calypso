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
} ): string | number | undefined {
	if ( ! selectedSite?.slug && ( isLoggedOutCart || isNoSiteCart ) ) {
		return 'no-user';
	}
	if ( ! selectedSite?.slug && ! isLoggedOutCart && ! isNoSiteCart ) {
		return 'no-site';
	}
	if ( selectedSite?.slug && ( isLoggedOutCart || isNoSiteCart ) ) {
		return selectedSite.slug;
	}

	return selectedSite?.ID ?? 'no-site';
}
