/**
 * Internal dependencies
 */
import { SiteData } from 'calypso/state/ui/selectors/site-data';

export default function getCartKey( {
	selectedSite,
	isLoggedOutCart,
	isNoSiteCart,
	waitForOtherCartUpdates,
}: {
	selectedSite: SiteData | undefined | null;
	isLoggedOutCart?: boolean;
	isNoSiteCart?: boolean;
	waitForOtherCartUpdates?: boolean;
} ): string | number | undefined {
	// We have to monitor the old cart manager in case it's waiting on a
	// requested change. To prevent race conditions, we will return undefined in
	// that case, which will cause the ShoppingCartProvider to enter a loading
	// state.
	if ( waitForOtherCartUpdates ) {
		return undefined;
	}

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
