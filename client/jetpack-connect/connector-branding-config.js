import { __, sprintf } from '@wordpress/i18n';
import { Icon, chartBar, next, share } from '@wordpress/icons';
import { getLogoForFamilies, getPresentFamilies, isStore } from './connection-content';

const DEFAULT_PERMISSIONS = [
	{
		icon: <Icon icon={ chartBar } />,
		label: __( 'Process detailed visitor stats in the cloud, so your site stays fast.' ),
	},
	{
		icon: <Icon icon={ next } />,
		label: __( "Improve your site's performance and SEO automatically." ),
	},
	{
		icon: <Icon icon={ share } />,
		label: __( "Automatically share your site's posts on social media." ),
	},
];

const DEFAULT_PERMISSIONS_TITLE = ( { siteURL } = {} ) =>
	siteURL
		? sprintf(
				/* translators: %(siteURL)s is the site's hostname (no protocol). */
				__( 'This connection on %(siteURL)s allows Jetpack to:' ),
				{ siteURL }
		  )
		: __( 'This connection allows Jetpack to:' );

/**
 * Determine the composite connector logo based on which plugin families are
 * present in the slugs list. Mirrors the PHP `get_connector_logo_url()` logic
 * in class-jetpack-connector.php.
 * @param {string[]} pluginSlugs - Array of plugin slugs from the query parameter.
 * @returns {string} Imported SVG URL for the matching connector logo.
 */
export function getConnectorLogoUrl( pluginSlugs = [] ) {
	return getLogoForFamilies( getPresentFamilies( pluginSlugs ) );
}

/**
 * Resolve branding (logo, title, subtitle, permissionsTitle, permissions) for the
 * connector flow based on the plugin slugs passed via the `plugins` query parameter.
 *
 * The title adapts based on whether WooCommerce is among the plugins.
 * The logo is resolved via family-based prefix matching across all slugs.
 * @param {string[]} pluginSlugs - Array of plugin slugs from the query parameter.
 * @returns {{ logo: string, title: string, subtitle: string, permissionsTitle: ( ( ctx?: { siteURL?: string } ) => string ), permissions: Array }} Branding object.
 */
export function getConnectorBranding( pluginSlugs = [] ) {
	const families = getPresentFamilies( pluginSlugs );
	const hasStore = isStore( pluginSlugs );
	const logo = getLogoForFamilies( families );
	const title = hasStore ? __( 'Connect your store' ) : __( 'Connect your site' );
	const subtitle = hasStore
		? __( 'Connect your store to unlock powerful features.' )
		: __( 'Connect your site to unlock powerful features.' );

	return {
		logo,
		title,
		subtitle,
		permissionsTitle: DEFAULT_PERMISSIONS_TITLE,
		permissions: DEFAULT_PERMISSIONS,
	};
}
