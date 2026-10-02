/**
 * Menu destinations for the widget's "Explore more" link, most preferred first.
 *
 * Read from wp-admin's own menu rather than built from `admin_url`, because whether each
 * page exists depends on the Jetpack version, the site's host and the user's
 * capabilities — the menu already reflects all of that. `$=` keeps My Jetpack's own
 * item from matching its deep links, such as `page=my-jetpack#/add-videopress`.
 */
const MENU_DESTINATIONS = [
	{ destination: 'my_jetpack', selector: '#adminmenu a[href$="page=my-jetpack"]' },
	{ destination: 'settings', selector: '#adminmenu a[href*="page=jetpack#/settings"]' },
];

/**
 * Resolve where "Explore more" should go: My Jetpack, then Jetpack's Settings, and
 * `fallbackUrl` when the Jetpack menu is absent altogether (as on Simple sites).
 * `destination` names the choice, for Tracks.
 * @param fallbackUrl Destination when neither menu item is on the page.
 */
export default function getExploreMoreUrl( fallbackUrl: string ): {
	url: string;
	destination: string;
} {
	for ( const { destination, selector } of MENU_DESTINATIONS ) {
		const link = document.querySelector< HTMLAnchorElement >( selector );
		if ( link?.href ) {
			return { url: link.href, destination };
		}
	}

	return { url: fallbackUrl, destination: 'stats' };
}
