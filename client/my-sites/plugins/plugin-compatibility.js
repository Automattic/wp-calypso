/**
 * This is a list of plugins not supported on WordPress.com Atomic sites.
 *
 * If this list is modified, please ensure that the support document also reflects
 * any changes made:
 *  - https://en.support.wordpress.com/incompatible-plugins
 *
 * Please keep this list alphabetized within the different categories!
 */

const incompatiblePlugins = new Set( [
	// "reset" - break/interfere with provided functionality
	'advanced-wp-reset',
	'extended-wp-reset',
	'factory-reset',
	'file-manager',
	'hide-my-wp',
	'plugins-garbage-collector',
	'reset-wp',
	'reset',
	'ultimate-wp-reset',
	'username-changer',
	'vamtam-offline-jetpack',
	'wd-youtube',
	'wordpress-reset',
	'wp-automatic',
	'wp-clone-by-wp-academy',
	'wp-file-manager',
	'wp-uninstaller-by-azed',
	'wpmu-database-reset',
	'wps-hide-login',
	'wp-downgrade',

	// backup
	'backwpup',
	'backwpup-pro',
	'duplicator',
	'jetpack-backup',
	'siteground-migrator',
	'wp-backitup',

	// caching
	'breeze',
	'cache-enabler',
	'comet-cache',
	'hyper-cache',
	'object-cache-pro',
	'powered-cache',
	'redis-cache',
	'sg-cachepress',
	'w3-total-cache',
	'wp-fastest-cache',
	'wp-optimizer',
	'wp-scss',
	'wp-speed-of-light',
	'wp-super-cache',

	// sql heavy
	'another-wordpress-classifieds-plugin',
	'mass-pagesposts-creator',
	'ol_scrapes',
	'post-views-counter',
	'top-10',
	'userpro',
	'wp-inject',
	'wp-postviews',
	'wp-rss-aggregator',
	'wp-rss-feed-to-post',
	'wp-rss-wordai',
	'wp-session-manager',
	'wp-slimstat',
	'WPRobot5',

	// security
	'antihacker',
	'disable-xml-rpc-api',
	'manage-xml-rpc',
	'one-click-ssl',
	'really-simple-ssl',
	'really-simple-ssl-pro',
	'stopbadbots',
	'wee-remove-xmlrpc-methods',
	'wp-hide-security-enhancer',
	'wp-simple-firewall',

	// spam
	'e-mail-broadcasting',
	'mailit',
	'send-email-from-admin',

	// misc
	'adult-mass-photos-downloader',
	'adult-mass-videos-embedder',
	'automatic-video-posts',
	'bwp-minify',
	'db-access-adminer',
	'nginx-helper',
	'p3',
	'pexlechris-adminer',
	'plugin-detective',
	'porn-embed',
	'porn-videos-embed',
	'propellerads-official',
	'trafficzion',
	'tubeace',
	'woozone',
	'wp-monero-miner-pro',
	'wp-optimize-by-xtraffic',
	'wpematico',
	'wpstagecoach',
	'yuzo-related-post',
	'zapp-proxy-server',
] );

export function isCompatiblePlugin( pluginSlug ) {
	return ! incompatiblePlugins.has( pluginSlug );
}
