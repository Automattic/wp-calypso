import { __, sprintf } from '@wordpress/i18n';
import { Icon, chartBar, next, share } from '@wordpress/icons';
import { getLogoForFamilies, getPresentFamilies } from './connection-content';

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
 * Resolve branding (logo, permissionsTitle, permissions) for the connector
 * flow based on the plugin slugs passed via the `plugins` query parameter.
 *
 * Title and subtitle are owned by `connection-content/copy.ts` (consumed via
 * `getAuthCopy` / `getSignupCopy` / `getLoginCopy` on the auth, signup, and
 * login surfaces). The logo is resolved via family-based prefix matching
 * across all slugs.
 *
 * The connector authorize page no longer reads `permissions*` from this
 * resolver — it renders the dynamic `<FeaturesSection />` instead. The
 * remaining consumers are the legacy `isFromJetpackOnboarding` and
 * `isFromMyJetpack` paths, which still render the static
 * `<PermissionsList />`. Those `permissions*` fields will be removed in a
 * follow-up PR once those paths migrate (or are retired).
 * @param {string[]} pluginSlugs - Array of plugin slugs from the query parameter.
 * @returns {{ logo: string, permissionsTitle: ( ( ctx?: { siteURL?: string } ) => string ), permissions: Array }} Branding object.
 */
export function getConnectorBranding( pluginSlugs = [] ) {
	const families = getPresentFamilies( pluginSlugs );
	const logo = getLogoForFamilies( families );

	return {
		logo,
		permissionsTitle: DEFAULT_PERMISSIONS_TITLE,
		permissions: DEFAULT_PERMISSIONS,
	};
}
