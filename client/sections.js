/**
 * External dependencies
 */
const fs = require( 'fs' ); // eslint-disable-line import/no-nodejs-modules
const path = require( 'path' ); // eslint-disable-line import/no-nodejs-modules

const sections = [
	{
		name: 'root',
		paths: [ '/' ],
		module: 'wp-calypso-client/root',
		group: 'root',
		secondary: true,
		enableLoggedOut: true,
	},
	{
		name: 'sites',
		paths: [ '/sites' ],
		module: 'wp-calypso-client/my-sites',
		group: 'sites',
		secondary: true,
	},
	{
		name: 'customize',
		paths: [ '/customize' ],
		module: 'wp-calypso-client/my-sites/customize',
		group: 'sites',
		secondary: true,
	},
	{
		name: 'me',
		paths: [ '/me' ],
		module: 'wp-calypso-client/me',
		group: 'me',
		secondary: true,
	},
	{
		name: 'account',
		paths: [ '/me/account' ],
		module: 'wp-calypso-client/me/account',
		group: 'me',
		secondary: true,
	},
	{
		name: 'account-close',
		paths: [ '/me/account/close', '/me/account/closed' ],
		module: 'wp-calypso-client/me/account-close',
		group: 'me',
		secondary: true,
	},
	{
		name: 'activity',
		paths: [ '/activity-log' ],
		module: 'wp-calypso-client/my-sites/activity',
		secondary: true,
		group: 'sites',
	},
	{
		name: 'security',
		paths: [ '/me/security' ],
		module: 'wp-calypso-client/me/security',
		group: 'me',
		secondary: true,
	},
	{
		name: 'privacy',
		paths: [ '/me/privacy' ],
		module: 'wp-calypso-client/me/privacy',
		group: 'me',
		secondary: true,
	},
	{
		name: 'purchases',
		paths: [ '/me/purchases', '/purchases', '/me/billing', '/payment-methods/add-credit-card' ],
		module: 'wp-calypso-client/me/purchases',
		group: 'me',
		secondary: true,
	},
	{
		name: 'notification-settings',
		paths: [ '/me/notifications' ],
		module: 'wp-calypso-client/me/notification-settings',
		group: 'me',
		secondary: true,
	},
	{
		name: 'site-blocks',
		paths: [ '/me/site-blocks' ],
		module: 'wp-calypso-client/me/site-blocks',
		group: 'me',
		secondary: true,
	},
	{
		name: 'concierge',
		paths: [ '/me/concierge' ],
		module: 'wp-calypso-client/me/concierge',
		group: 'me',
		secondary: false,
	},
	{
		name: 'media',
		paths: [ '/media' ],
		module: 'wp-calypso-client/my-sites/media',
		group: 'sites',
		secondary: true,
	},
	{
		name: 'people',
		paths: [ '/people' ],
		module: 'wp-calypso-client/my-sites/people',
		secondary: true,
		group: 'sites',
	},
	{
		name: 'plugins',
		paths: [ '/plugins' ],
		module: 'wp-calypso-client/my-sites/plugins',
		secondary: true,
		group: 'sites',
	},
	{
		name: 'pages',
		paths: [ '/pages' ],
		module: 'wp-calypso-client/my-sites/pages',
		secondary: true,
		group: 'sites',
	},
	{
		name: 'posts',
		paths: [ '/posts' ],
		module: 'wp-calypso-client/my-sites/posts',
		secondary: true,
		group: 'sites',
	},
	{
		name: 'settings-performance',
		paths: [ '/settings/performance' ],
		module: 'wp-calypso-client/my-sites/site-settings/settings-performance',
		secondary: true,
		group: 'sites',
	},
	{
		name: 'settings-writing',
		paths: [ '/settings/writing', '/settings/taxonomies', '/settings/podcasting' ],
		module: 'wp-calypso-client/my-sites/site-settings/settings-writing',
		secondary: true,
		group: 'sites',
	},
	{
		name: 'settings-discussion',
		paths: [ '/settings/discussion' ],
		module: 'wp-calypso-client/my-sites/site-settings/settings-discussion',
		secondary: true,
		group: 'sites',
	},
	{
		name: 'settings-security',
		paths: [ '/settings/security' ],
		module: 'wp-calypso-client/my-sites/site-settings/settings-security',
		secondary: true,
		group: 'sites',
	},
	{
		name: 'settings-jetpack',
		paths: [ '/settings/jetpack' ],
		module: 'wp-calypso-client/my-sites/site-settings/settings-jetpack',
		secondary: true,
		group: 'sites',
	},
	{
		name: 'settings',
		paths: [ '/settings' ],
		module: 'wp-calypso-client/my-sites/site-settings',
		secondary: true,
		group: 'sites',
	},
	{
		name: 'marketing',
		paths: [ '/marketing', '/sharing' ],
		module: 'wp-calypso-client/my-sites/marketing',
		secondary: true,
		group: 'sites',
	},
	{
		name: 'jetpack-connect',
		paths: [ '/jetpack' ],
		module: 'wp-calypso-client/jetpack-connect',
		secondary: false,
		enableLoggedOut: true,
	},
	{
		name: 'purchase-product',
		paths: [ '/purchase-product' ],
		module: 'wp-calypso-client/my-sites/purchase-product',
		secondary: true,
		enableLoggedOut: true,
	},
	{
		name: 'signup',
		paths: [ '/start' ],
		module: 'wp-calypso-client/signup',
		secondary: false,
		enableLoggedOut: true,
		isomorphic: true,
	},
	{
		name: 'stats',
		paths: [ '/stats' ],
		module: 'wp-calypso-client/my-sites/stats',
		secondary: true,
		group: 'sites',
		trackLoadPerformance: true,
	},
	{
		name: 'google-my-business',
		paths: [ '/google-my-business' ],
		module: 'wp-calypso-client/my-sites/google-my-business',
		secondary: true,
		group: 'sites',
	},
	// Since we're using find() and startsWith() on paths, 'themes' needs to go before 'theme',
	// or it'll be falsely associated with the latter section.
	{
		name: 'themes',
		paths: [ '/themes', '/design' ],
		module: 'wp-calypso-client/my-sites/themes',
		enableLoggedOut: true,
		secondary: true,
		group: 'sites',
		isomorphic: true,
		title: 'Themes',
	},
	{
		name: 'theme',
		paths: [ '/theme' ],
		module: 'wp-calypso-client/my-sites/theme',
		enableLoggedOut: true,
		secondary: false,
		group: 'sites',
		isomorphic: true,
		title: 'Themes',
	},
	{
		name: 'domains',
		paths: [ '/domains' ],
		module: 'wp-calypso-client/my-sites/domains',
		secondary: true,
		group: 'sites',
	},
	{
		name: 'email',
		paths: [ '/email' ],
		module: 'wp-calypso-client/my-sites/email',
		secondary: true,
		group: 'sites',
	},
	{
		name: 'checkout',
		paths: [ '/checkout' ],
		module: 'wp-calypso-client/my-sites/checkout',
		secondary: true,
		group: 'sites',
		enableLoggedOut: true,
	},
	{
		name: 'plans',
		paths: [ '/plans' ],
		module: 'wp-calypso-client/my-sites/plans',
		secondary: true,
		group: 'sites',
		trackLoadPerformance: true,
	},
	{
		name: 'accept-invite',
		paths: [ '/accept-invite' ],
		module: 'wp-calypso-client/my-sites/invites',
		enableLoggedOut: true,
	},
	{
		name: 'earn',
		paths: [ '/earn', '/ads' ],
		module: 'wp-calypso-client/my-sites/earn',
		secondary: true,
		group: 'sites',
	},
	{
		name: 'mailing-lists',
		paths: [ '/mailing-lists/unsubscribe' ],
		module: 'wp-calypso-client/mailing-lists',
		secondary: false,
		enableLoggedOut: true,
		group: 'me',
	},
	{
		name: 'post-editor',
		paths: [ '/post', '/page', '/edit' ],
		module: 'wp-calypso-client/post-editor',
		group: 'editor',
		secondary: true,
	},
	// this MUST be the first section for /read paths so subsequent sections under /read can override settings
	{
		name: 'reader',
		paths: [ '/read' ],
		module: 'wp-calypso-client/reader',
		secondary: true,
		group: 'reader',
		trackLoadPerformance: true,
	},
	{
		name: 'reader',
		paths: [ '/read/feeds/[^\\/]+', '/read/blogs/[^\\/]+', '/read/a8c', '/recommendations' ],
		module: 'wp-calypso-client/reader',
		secondary: true,
		group: 'reader',
		trackLoadPerformance: true,
	},
	{
		name: 'reader',
		paths: [ '/read/feeds/[^\\/]+/posts/[^\\/]+', '/read/blogs/[^\\/]+/posts/[^\\/]+' ],
		module: 'wp-calypso-client/reader/full-post',
		secondary: false,
		group: 'reader',
		trackLoadPerformance: true,
	},
	{
		name: 'reader',
		paths: [ '/discover' ],
		module: 'wp-calypso-client/reader/discover',
		secondary: true,
		group: 'reader',
		trackLoadPerformance: true,
	},
	{
		name: 'reader',
		paths: [ '/following' ],
		module: 'wp-calypso-client/reader/following',
		secondary: true,
		group: 'reader',
	},
	{
		name: 'reader',
		paths: [ '/tags', '/tag' ],
		module: 'wp-calypso-client/reader/tag-stream',
		secondary: true,
		group: 'reader',
		trackLoadPerformance: true,
	},
	{
		name: 'reader',
		paths: [ '/activities' ],
		module: 'wp-calypso-client/reader/liked-stream',
		secondary: true,
		group: 'reader',
		trackLoadPerformance: true,
	},
	{
		name: 'reader',
		paths: [ '/read/search' ],
		module: 'wp-calypso-client/reader/search',
		secondary: true,
		group: 'reader',
		trackLoadPerformance: true,
	},
	{
		name: 'reader',
		paths: [ '/read/list' ],
		module: 'wp-calypso-client/reader/list',
		secondary: true,
		group: 'reader',
	},
	{
		name: 'reader',
		paths: [ '/read/conversations' ],
		module: 'wp-calypso-client/reader/conversations',
		secondary: true,
		group: 'reader',
		trackLoadPerformance: true,
	},
	{
		name: 'help',
		paths: [ '/help' ],
		module: 'wp-calypso-client/me/help',
		secondary: true,
		enableLoggedOut: true,
		group: 'me',
	},
	{
		name: 'auth',
		paths: [ '/oauth-login', '/authorize', '/api/oauth/token' ],
		module: 'wp-calypso-client/auth',
		secondary: false,
		enableLoggedOut: true,
	},
	{
		name: 'posts-custom',
		paths: [ '/types' ],
		module: 'wp-calypso-client/my-sites/types',
		secondary: true,
		group: 'sites',
	},
	{
		name: 'happychat',
		paths: [ '/me/chat' ],
		module: 'wp-calypso-client/me/happychat',
		group: 'me',
		secondary: true,
	},
	{
		name: 'comments',
		paths: [ '/comments', '/comment' ],
		module: 'wp-calypso-client/my-sites/comments',
		group: 'sites',
		secondary: true,
	},
	{
		name: 'preview',
		paths: [ '/view' ],
		module: 'wp-calypso-client/my-sites/preview',
		group: 'sites',
		secondary: true,
	},
	{
		name: 'domain-connect-authorize',
		paths: [ '/domain-connect' ],
		module: 'wp-calypso-client/my-sites/domains/domain-management/domain-connect',
		secondary: false,
	},
	{
		name: 'gutenberg-editor',
		paths: [ '/block-editor', '/site-editor' ],
		module: 'wp-calypso-client/gutenberg/editor',
		group: 'gutenberg',
		secondary: false,
		trackLoadPerformance: true,
	},
	{
		name: 'import',
		paths: [ '/import' ],
		module: 'wp-calypso-client/my-sites/importer',
		secondary: true,
		group: 'sites',
	},
	{
		name: 'export',
		paths: [ '/export' ],
		module: 'wp-calypso-client/my-sites/exporter',
		secondary: true,
		group: 'sites',
	},
	{
		name: 'migrate',
		paths: [ '/migrate' ],
		module: 'wp-calypso-client/my-sites/migrate',
		secondary: true,
		group: 'sites',
	},
	{
		name: 'devdocs',
		paths: [ '/devdocs' ],
		module: 'wp-calypso-client/devdocs',
		secondary: true,
		enableLoggedOut: true,
	},
	{
		name: 'devdocs',
		paths: [ '/devdocs/start' ],
		module: 'wp-calypso-client/devdocs',
		secondary: false,
		enableLoggedOut: true,
	},
	{
		name: 'home',
		paths: [ '/home' ],
		module: 'wp-calypso-client/my-sites/customer-home',
		secondary: true,
		group: 'sites',
		trackLoadPerformance: true,
	},
	{
		name: 'hosting',
		paths: [ '/hosting-config' ],
		module: 'wp-calypso-client/my-sites/hosting',
		secondary: true,
		group: 'sites',
	},
	{
		name: 'backup',
		paths: [ '/backup' ],
		module: 'wp-calypso-client/my-sites/backup',
		secondary: true,
		group: 'sites',
	},
	{
		name: 'scan',
		paths: [ '/scan' ],
		module: 'wp-calypso-client/my-sites/scan',
		secondary: true,
		group: 'sites',
	},
	{
		name: 'jetpack-cloud',
		paths: [ '/', '/landing', '/settings', '/oauth-override' ],
		module: 'wp-calypso-client/landing/jetpack-cloud',
		secondary: true,
		group: 'jetpack-cloud',
		enableLoggedOut: true,
	},
	{
		name: 'jetpack-cloud-settings',
		paths: [ '/settings' ],
		module: 'wp-calypso-client/landing/jetpack-cloud/sections/settings',
		secondary: true,
		group: 'jetpack-cloud',
		enableLoggedOut: true,
	},
	{
		name: 'jetpack-cloud-auth',
		paths: [ '/connect', '/connect/oauth/token' ],
		module: 'wp-calypso-client/landing/jetpack-cloud/sections/auth',
		secondary: true,
		group: 'jetpack-cloud',
		enableLoggedOut: true,
	},
];

for ( const extension of require( './extensions' ) ) {
	try {
		const pkgPath = path.join( __dirname, 'extensions', extension, 'package.json' );
		const pkg = JSON.parse( fs.readFileSync( pkgPath ) );
		sections.push( {
			...pkg.section,
			envId: pkg.env_id,
		} );
	} catch {}
}

module.exports = sections;
