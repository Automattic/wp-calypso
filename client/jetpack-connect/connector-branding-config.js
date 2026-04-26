import { __ } from '@wordpress/i18n';
import { Icon, chartBar, next, share, search, video, shield } from '@wordpress/icons';
import jetpackConnectA8cLogo from './images/jetpack-connect-a8c.svg';
import jetpackConnectAllLogo from './images/jetpack-connect-all.svg';
import jetpackConnectWooLogo from './images/jetpack-connect-woo.svg';
import jetpackConnectLogo from './images/jetpack-connect.svg';

const PLUGIN_BRANDING = {
	jetpack: {
		title: __( 'Connect Jetpack' ),
		subtitle: __( 'Connect your site to unlock powerful Jetpack features.' ),
		permissions: [
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
		],
	},
	'jetpack-boost': {
		title: __( 'Connect Jetpack Boost' ),
		subtitle: __( 'Speed up your site and improve your Core Web Vitals.' ),
		permissions: [
			{
				icon: <Icon icon={ next } />,
				label: __( 'Optimize CSS and defer non-essential JavaScript.' ),
			},
			{
				icon: <Icon icon={ chartBar } />,
				label: __( 'Track your site speed score over time.' ),
			},
		],
	},
	'jetpack-social': {
		title: __( 'Connect Jetpack Social' ),
		subtitle: __( 'Automatically share your posts on social media.' ),
		permissions: [
			{
				icon: <Icon icon={ share } />,
				label: __( 'Share posts to connected social media accounts.' ),
			},
			{
				icon: <Icon icon={ chartBar } />,
				label: __( 'Track social sharing engagement.' ),
			},
		],
	},
	'jetpack-search': {
		title: __( 'Connect Jetpack Search' ),
		subtitle: __( 'Deliver fast, relevant search results to your visitors.' ),
		permissions: [
			{
				icon: <Icon icon={ search } />,
				label: __( 'Index your site content for instant search results.' ),
			},
			{
				icon: <Icon icon={ chartBar } />,
				label: __( 'Provide search analytics and insights.' ),
			},
		],
	},
	'jetpack-videopress': {
		title: __( 'Connect Jetpack VideoPress' ),
		subtitle: __( 'Host and embed high-quality, ad-free video.' ),
		permissions: [
			{
				icon: <Icon icon={ video } />,
				label: __( 'Upload and stream ad-free video from the cloud.' ),
			},
			{
				icon: <Icon icon={ chartBar } />,
				label: __( 'Track video playback stats.' ),
			},
		],
	},
	'jetpack-backup': {
		title: __( 'Connect Jetpack Backup' ),
		subtitle: __( 'Real-time cloud backups with one-click restores.' ),
		permissions: [
			{
				icon: <Icon icon={ shield } />,
				label: __( 'Back up your entire site in real time.' ),
			},
			{
				icon: <Icon icon={ next } />,
				label: __( 'Restore your site to any previous state with one click.' ),
			},
		],
	},
};

const DEFAULT_BRANDING = PLUGIN_BRANDING.jetpack;

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
 * Resolve branding (logo, title, subtitle, permissions) for the connector flow
 * based on the plugin slugs passed via the `plugins` query parameter.
 *
 * When multiple slugs are provided, the first recognized slug drives the
 * title/subtitle/permissions. The logo is always resolved via family-based
 * prefix matching across all slugs.
 * Falls back to generic Jetpack branding for unknown slugs.
 * @param {string[]} pluginSlugs - Array of plugin slugs from the query parameter.
 * @returns {{ logo: string, title: string, subtitle: string, permissions: Array }} Branding object.
 */
export function getConnectorBranding( pluginSlugs = [] ) {
	const logo = getConnectorLogoUrl( pluginSlugs );

	for ( const slug of pluginSlugs ) {
		if ( PLUGIN_BRANDING[ slug ] ) {
			return { ...PLUGIN_BRANDING[ slug ], logo };
		}
	}
	return { ...DEFAULT_BRANDING, logo };
}
