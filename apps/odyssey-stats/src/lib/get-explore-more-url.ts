// Read from wp-admin's menu, which already reflects the Jetpack version, host and user
// capabilities that decide whether each page exists. `$=` skips My Jetpack's deep links.
const MENU_DESTINATIONS = [
	{ destination: 'my_jetpack', selector: '#adminmenu a[href$="page=my-jetpack"]' },
	{ destination: 'settings', selector: '#adminmenu a[href*="page=jetpack#/settings"]' },
] as const;

export type ExploreMoreDestination =
	( typeof MENU_DESTINATIONS )[ number ][ 'destination' ] | 'stats';

/**
 * Where "Explore more" goes: My Jetpack, then Jetpack's Settings, then `fallbackUrl` where
 * there is no Jetpack menu (as on Simple sites).
 * @param fallbackUrl Destination when neither menu item is on the page.
 */
export default function getExploreMoreUrl( fallbackUrl: string ): {
	url: string;
	destination: ExploreMoreDestination;
} {
	for ( const { destination, selector } of MENU_DESTINATIONS ) {
		const link = document.querySelector< HTMLAnchorElement >( selector );
		if ( link?.href ) {
			return { url: link.href, destination };
		}
	}

	return { url: fallbackUrl, destination: 'stats' };
}
