import { __, sprintf } from '@wordpress/i18n';
import { Icon, chartBar, next, share } from '@wordpress/icons';
import jetpackConnectA8cLogo from './images/jetpack-connect-a8c.svg';
import jetpackConnectAllLogo from './images/jetpack-connect-all.svg';
import jetpackConnectWooLogo from './images/jetpack-connect-woo.svg';
import jetpackConnectLogo from './images/jetpack-connect.svg';

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
	let hasWoo = false;
	let hasA4a = false;

	for ( const slug of pluginSlugs ) {
		if ( slug.startsWith( 'woocommerce' ) ) {
			hasWoo = true;
		}
		if ( slug.startsWith( 'automattic' ) ) {
			hasA4a = true;
		}
	}

	if ( hasWoo && hasA4a ) {
		return jetpackConnectAllLogo;
	}
	if ( hasWoo ) {
		return jetpackConnectWooLogo;
	}
	if ( hasA4a ) {
		return jetpackConnectA8cLogo;
	}
	return jetpackConnectLogo;
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
	const logo = getConnectorLogoUrl( pluginSlugs );
	const hasWoo = pluginSlugs.some( ( slug ) => slug.startsWith( 'woocommerce' ) );
	const title = hasWoo ? __( 'Connect your store' ) : __( 'Connect your site' );
	const subtitle = hasWoo
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
