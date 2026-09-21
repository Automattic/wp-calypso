/**
 * Menu destinations for the widget's "Explore more" link, most preferred first.
 *
 * Read from wp-admin's own menu rather than built from `admin_url`, because whether each
 * page exists depends on the Jetpack version, the site's host and the user's
 * capabilities — the menu already reflects all of that. `$=` keeps My Jetpack's own
 * item from matching its deep links, such as `page=my-jetpack#/add-videopress`.
 */
const MENU_LINK_SELECTORS = [
	'#adminmenu a[href$="page=my-jetpack"]',
	'#adminmenu a[href*="page=jetpack#/settings"]',
];

/**
 * Resolve where "Explore more" should go: My Jetpack, then Jetpack's Settings, and
 * `fallbackUrl` when the Jetpack menu is absent altogether (as on Simple sites).
 * @param fallbackUrl Destination when neither menu item is on the page.
 */
export default function getExploreMoreUrl( fallbackUrl: string ): string {
	for ( const selector of MENU_LINK_SELECTORS ) {
		const link = document.querySelector< HTMLAnchorElement >( selector );
		if ( link?.href ) {
			return link.href;
		}
	}

	return fallbackUrl;
}
