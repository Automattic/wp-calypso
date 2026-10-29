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
 * remaining consumer is the legacy `isFromMyJetpack` path, which still
 * renders the static `<PermissionsList />`.
 * @param {string[]} pluginSlugs - Array of plugin slugs from the query parameter.
 * @returns {{ logo: string, logoAlt: string, permissionsTitle: ( ( ctx?: { siteURL?: string } ) => string ), permissions: Array }} Branding object.
 */
export function getConnectorBranding( pluginSlugs = [] ) {
	const families = getPresentFamilies( pluginSlugs );
	const logo = getLogoForFamilies( families );

	return {
		logo,
		logoAlt: families.includes( 'migration' ) ? 'WordPress.com' : 'Jetpack Connection logo',
		permissionsTitle: DEFAULT_PERMISSIONS_TITLE,
		permissions: DEFAULT_PERMISSIONS,
	};
}
