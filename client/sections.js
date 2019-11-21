/**
 * External dependencies
 */
const fs = require( 'fs' ); // eslint-disable-line import/no-nodejs-modules
const path = require( 'path' ); // eslint-disable-line import/no-nodejs-modules

const sections = [
	{
		name: 'sites',
		paths: [ '/sites' ],
		module: 'my-sites',
		group: 'sites',
		secondary: true,
	},
	{
		name: 'customize',
		paths: [ '/customize' ],
		module: 'my-sites/customize',
		group: 'sites',
		secondary: true,
	},
	{
		name: 'me',
		paths: [ '/me' ],
		module: 'me',
		group: 'me',
		secondary: true,
	},
	{
		name: 'account',
		paths: [ '/me/account' ],
		module: 'me/account',
		group: 'me',
		secondary: true,
	},
	{
		name: 'account-close',
		paths: [ '/me/account/close' ],
		module: 'me/account-close',
		group: 'me',
		secondary: true,
	},
	{
		name: 'activity',
		paths: [ '/activity-log' ],
		module: 'my-sites/activity',
		secondary: true,
		group: 'sites',
	},
	{
		name: 'security',
		paths: [ '/me/security' ],
		module: 'me/security',
		group: 'me',
		secondary: true,
	},
	{
		name: 'privacy',
		paths: [ '/me/privacy' ],
		module: 'me/privacy',
		group: 'me',
		secondary: true,
	},
	{
		name: 'purchases',
		paths: [ '/me/purchases', '/purchases', '/me/billing', '/payment-methods/add-credit-card' ],
		module: 'me/purchases',
		group: 'me',
		secondary: true,
	},
	{
		name: 'notification-settings',
		paths: [ '/me/notifications' ],
		module: 'me/notification-settings',
		group: 'me',
		secondary: true,
	},
	{
		name: 'site-blocks',
		paths: [ '/me/site-blocks' ],
		module: 'me/site-blocks',
		group: 'me',
		secondary: true,
	},
	{
		name: 'concierge',
		paths: [ '/me/concierge' ],
		module: 'me/concierge',
		group: 'me',
		secondary: false,
	},
	{
		name: 'media',
		paths: [ '/media' ],
		module: 'my-sites/media',
		group: 'sites',
		secondary: true,
	},
	{
		name: 'people',
		paths: [ '/people' ],
		module: 'my-sites/people',
		secondary: true,
		group: 'sites',
	},
	{
		name: 'plugins',
		paths: [ '/plugins' ],
		module: 'my-sites/plugins',
		secondary: true,
		group: 'sites',
	},
	{
		name: 'pages',
		paths: [ '/pages' ],
		module: 'my-sites/pages',
		secondary: true,
		group: 'sites',
	},
	{
		name: 'posts',
		paths: [ '/posts' ],
		module: 'my-sites/posts',
		secondary: true,
		group: 'sites',
	},
	{
		name: 'settings-performance',
		paths: [ '/settings/performance' ],
		module: 'my-sites/site-settings/settings-performance',
		secondary: true,
		group: 'sites',
	},
	{
		name: 'settings-writing',
		paths: [ '/settings/writing', '/settings/taxonomies', '/settings/podcasting' ],
		module: 'my-sites/site-settings/settings-writing',
		secondary: true,
		group: 'sites',
	},
	{
		name: 'settings-discussion',
		paths: [ '/settings/discussion' ],
		module: 'my-sites/site-settings/settings-discussion',
		secondary: true,
		group: 'sites',
	},
	{
		name: 'settings-security',
		paths: [ '/settings/security' ],
		module: 'my-sites/site-settings/settings-security',
		secondary: true,
		group: 'sites',
	},
	{
		name: 'settings',
		paths: [ '/settings' ],
		module: 'my-sites/site-settings',
		secondary: true,
		group: 'sites',
	},
	{
		name: 'marketing',
		paths: [ '/marketing', '/sharing' ],
		module: 'my-sites/marketing',
		secondary: true,
		group: 'sites',
	},
	{
		name: 'jetpack-connect',
		paths: [ '/jetpack' ],
		module: 'jetpack-connect',
		secondary: false,
		enableLoggedOut: true,
	},
	{
		name: 'jetpack-onboarding',
		paths: [ '/jetpack/start' ],
		module: 'jetpack-onboarding',
		secondary: false,
		enableLoggedOut: true,
	},
	{
		name: 'signup',
		paths: [ '/start' ],
		module: 'signup',
		secondary: false,
		enableLoggedOut: true,
		isomorphic: true,
	},
	{
		name: 'stats',
		paths: [ '/stats' ],
		module: 'my-sites/stats',
		secondary: true,
		group: 'sites',
	},
	{
		name: 'checklist',
		paths: [ '/checklist' ],
		module: 'my-sites/checklist',
		secondary: true,
		group: 'checklist',
	},
	{
		name: 'google-my-business',
		paths: [ '/google-my-business' ],
		module: 'my-sites/google-my-business',
		secondary: true,
		group: 'sites',
	},
	// Since we're using find() and startsWith() on paths, 'themes' needs to go before 'theme',
	// or it'll be falsely associated with the latter section.
	{
		name: 'themes',
		paths: [ '/themes', '/design' ],
		module: 'my-sites/themes',
		enableLoggedOut: true,
		secondary: true,
		group: 'sites',
		isomorphic: true,
		title: 'Themes',
	},
	{
		name: 'theme',
		paths: [ '/theme' ],
		module: 'my-sites/theme',
		enableLoggedOut: true,
		secondary: false,
		group: 'sites',
		isomorphic: true,
		title: 'Themes',
	},
	{
		name: 'domains',
		paths: [ '/domains' ],
		module: 'my-sites/domains',
		secondary: true,
		group: 'sites',
	},
	{
		name: 'email',
		paths: [ '/email' ],
		module: 'my-sites/email',
		secondary: true,
		group: 'sites',
	},
	{
		name: 'checkout',
		paths: [ '/checkout' ],
		module: 'my-sites/checkout',
		secondary: true,
		group: 'sites',
		enableLoggedOut: true,
	},
	{
		name: 'plans',
		paths: [ '/plans' ],
		module: 'my-sites/plans',
		secondary: true,
		group: 'sites',
	},
	{
		name: 'accept-invite',
		paths: [ '/accept-invite' ],
		module: 'my-sites/invites',
		enableLoggedOut: true,
	},
	{
		name: 'earn',
		paths: [ '/earn', '/ads' ],
		module: 'my-sites/earn',
		secondary: true,
		group: 'sites',
	},
	{
		name: 'mailing-lists',
		paths: [ '/mailing-lists/unsubscribe' ],
		module: 'mailing-lists',
		enableLoggedOut: true,
	},
	{
		name: 'feature-upsell',
		paths: [ '/feature' ],
		module: 'my-sites/feature-upsell',
		group: 'sites',
		secondary: true,
	},
	{
		name: 'post-editor',
		paths: [ '/post', '/page', '/edit' ],
		module: 'post-editor',
		group: 'editor',
		secondary: true,
	},
	// this MUST be the first section for /read paths so subsequent sections under /read can override settings
	{
		name: 'reader',
		paths: [ '/', '/read' ],
		module: 'reader',
		secondary: true,
		group: 'reader',
	},
	{
		name: 'reader',
		paths: [ '/read/feeds/[^\\/]+', '/read/blogs/[^\\/]+', '/read/a8c' ],
		module: 'reader',
		secondary: true,
		group: 'reader',
	},
	{
		name: 'reader',
		paths: [ '/read/feeds/[^\\/]+/posts/[^\\/]+', '/read/blogs/[^\\/]+/posts/[^\\/]+' ],
		module: 'reader/full-post',
		secondary: false,
		group: 'reader',
	},
	{
		name: 'reader',
		paths: [ '/discover' ],
		module: 'reader/discover',
		secondary: true,
		group: 'reader',
	},
	{
		name: 'reader',
		paths: [ '/following' ],
		module: 'reader/following',
		secondary: true,
		group: 'reader',
	},
	{
		name: 'reader',
		paths: [ '/tags', '/tag' ],
		module: 'reader/tag-stream',
		secondary: true,
		group: 'reader',
	},
	{
		name: 'reader',
		paths: [ '/activities' ],
		module: 'reader/liked-stream',
		secondary: true,
		group: 'reader',
	},
	{
		name: 'reader',
		paths: [ '/read/search', '/recommendations' ],
		module: 'reader/search',
		secondary: true,
		group: 'reader',
	},
	{
		name: 'reader',
		paths: [ '/read/list' ],
		module: 'reader/list',
		secondary: true,
		group: 'reader',
	},
	{
		name: 'reader',
		paths: [ '/read/conversations' ],
		module: 'reader/conversations',
		secondary: true,
		group: 'reader',
	},
	{
		name: 'help',
		paths: [ '/help' ],
		module: 'me/help',
		secondary: true,
		enableLoggedOut: true,
		group: 'me',
	},
	{
		name: 'auth',
		paths: [ '/oauth-login', '/authorize', '/api/oauth/token' ],
		module: 'auth',
		secondary: false,
		enableLoggedOut: true,
	},
	{
		name: 'posts-custom',
		paths: [ '/types' ],
		module: 'my-sites/types',
		secondary: true,
		group: 'sites',
	},
	{
		name: 'happychat',
		paths: [ '/me/chat' ],
		module: 'me/happychat',
		group: 'me',
		secondary: true,
	},
	{
		name: 'comments',
		paths: [ '/comments', '/comment' ],
		module: 'my-sites/comments',
		group: 'sites',
		secondary: true,
	},
	{
		name: 'preview',
		paths: [ '/view' ],
		module: 'my-sites/preview',
		group: 'sites',
		secondary: true,
	},
	{
		name: 'domain-connect-authorize',
		paths: [ '/domain-connect' ],
		module: 'my-sites/domains/domain-management/domain-connect',
		secondary: false,
	},
	{
		name: 'gutenberg-editor',
		paths: [ '/block-editor' ],
		module: 'gutenberg/editor',
		group: 'gutenberg',
		secondary: false,
	},
	{
		name: 'import',
		paths: [ '/import' ],
		module: 'my-sites/importer',
		secondary: true,
		group: 'sites',
	},
	{
		name: 'export',
		paths: [ '/export' ],
		module: 'my-sites/exporter',
		secondary: true,
		group: 'sites',
	},
	{
		name: 'migrate',
		paths: [ '/migrate' ],
		module: 'my-sites/migrate',
		secondary: true,
		group: 'sites',
	},
	{
		name: 'devdocs',
		paths: [ '/devdocs' ],
		module: 'devdocs',
		secondary: true,
		enableLoggedOut: true,
	},
	{
		name: 'devdocs',
		paths: [ '/devdocs/start' ],
		module: 'devdocs',
		secondary: false,
		enableLoggedOut: true,
	},
	{
		name: 'home',
		paths: [ '/home' ],
		module: 'my-sites/customer-home',
		secondary: true,
		group: 'sites',
	},
	{
		name: 'hosting',
		paths: [ '/hosting-config' ],
		module: 'my-sites/hosting',
		secondary: true,
		group: 'sites',
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
