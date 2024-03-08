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
	'advanced-database-cleaner',
	'advanced-reset-wp',
	'advanced-wp-reset',
	'backup',
	'better-wp-security',
	'cf7-pipedrive-integration',
	'database-browser',
	'duplicator',
	'extended-wp-reset',
	'file-manager-advanced',
	'file-manager',
	'plugins-garbage-collector',
	'post-type-switcher',
	'reset-wp',
	'reset',
	'secure-file-manager',
	'ultimate-reset',
	'ultimate-wp-reset',
	'username-changer',
	'username-updater',
	'vamtam-offline-jetpack',
	'wd-youtube',
	'wordpress-database-reset',
	'wordpress-reset',
	'wp-automatic',
	'wp-clone-by-wp-academy',
	'wp-config-file-editor',
	'wp-dbmanager',
	'wp-file-manager',
	'wp-phpmyadmin-extension',
	'wp-prefix-changer',
	'wp-reset',
	'wp-uninstaller-by-azed',
	'wpmu-database-reset',
	'wps-hide-login',
	'z-inventory-manager',

	// backup
	'backup-wd',
	'backupwordpress',
	'backwpup',
	'jetpack-backup',
	'wp-db-backup',

	// caching
	'cache-enabler',
	'comet-cache',
	'hyper-cache',
	'jch-optimize',
	'performance-lab',
	'powered-cache',
	'quick-cache',
	'redis-cache',
	'sg-cachepress',
	'w3-total-cache',
	'wp-cache',
	'wp-fastest-cache',
	'wp-optimizer',
	'wp-speed-of-light',
	'wp-super-cache',

	// sql heavy
	'another-wordpress-classifieds-plugin',
	'broken-link-checker',
	'leads',
	'native-ads-adnow',
	'ol_scrapes',
	'page-visit-counter',
	'post-views-counter',
	'tokenad',
	'top-10',
	'userpro',
	'wordpress-popular-posts',
	'wp-cerber',
	'wp-inject',
	'wp-postviews',
	'wp-rss-aggregator',
	'wp-rss-feed-to-post',
	'wp-rss-wordai',
	'wp-session-manager',
	'wp-slimstat',
	'wp-statistics',
	'wp-ulike',
	'WPRobot5',

	// security
	'antihacker',
	'deactivate-xml-rpc-service',
	'disable-xml-rpc-api',
	'disable-xml-rpc-fully',
	'disable-xml-rpc-unset-x-pingback',
	'disable-xml-rpc',
	'manage-xml-rpc',
	'sg-security',
	'simple-xml-rpc-disabler',
	'stopbadbots',
	'wee-remove-xmlrpc-methods',
	'wordfence',
	'wp-hide-security-enhancer',
	'wp-security-hardening',
	'wp-simple-firewall',

	// spam
	'e-mail-broadcasting',
	'mailit',
	'send-email-from-admin',

	// cloning/staging
	'flo-launch',

	// misc
	'adult-mass-photos-downloader',
	'adult-mass-videos-embedder',
	'ari-adminer',
	'automatic-video-posts',
	'blogmatic-poster',
	'blogmatic',
	'bwp-minify',
	'clearfy',
	'cornerstone',
	'cryptocurrency-pricing-list',
	'db-access-adminer',
	'event-espresso-decaf',
	'facetwp-manipulator',
	'fast-velocity-minify',
	'nginx-helper',
	'p3',
	'pexlechris-adminer',
	'plugin-detective',
	'porn-embed',
	'propellerads-official',
	'really-simple-ssl',
	'speed-contact-bar',
	'trafficzion',
	'tubeace',
	'unplug-jetpack',
	'video-importer',
	'woozone',
	'wp-cleanfix',
	'wp-file-upload',
	'wp-monero-miner-pro',
	'wp-monero-miner-using-coin-hive',
	'wp-optimize-by-xtraffic',
	'wpcom-migration',
	'wpematico',
	'wpstagecoach',
	'yuzo-related-post',
	'zapp-proxy-server',

	// crm
	'civicrm',
] );

export function isCompatiblePlugin( pluginSlug ) {
	return ! incompatiblePlugins.has( pluginSlug );
}
