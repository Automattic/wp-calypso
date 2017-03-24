/**
 * Module variables
 */
const sections = [
	{
		name: 'sites',
		paths: [ '/sites' ],
		module: 'my-sites',
		group: 'sites',
		secondary: true
	},
	{
		name: 'customize',
		paths: [ '/customize' ],
		module: 'my-sites/customize',
		group: 'sites',
		secondary: true
	},
	{
		name: 'paladin',
		paths: [ '/paladin' ],
		module: 'my-sites/paladin',
		group: 'sites',
		secondary: true
	},
	{
		name: 'me',
		paths: [ '/me' ],
		module: 'me',
		group: 'me',
		secondary: true
	},
	{
		name: 'account',
		paths: [ '/me/account' ],
		module: 'me/account',
		group: 'me',
		secondary: true
	},
	{
		name: 'security',
		paths: [ '/me/security' ],
		module: 'me/security',
		group: 'me',
		secondary: true
	},
	{
		name: 'purchases',
		paths: [ '/me/purchases', '/purchases', '/me/billing', '/payment-methods/add-credit-card' ],
		module: 'me/purchases',
		group: 'me',
		secondary: true
	},
	{
		name: 'notification-settings',
		paths: [ '/me/notifications' ],
		module: 'me/notification-settings',
		group: 'me',
		secondary: true
	},
	{
		name: 'media',
		paths: [ '/media' ],
		module: 'my-sites/media',
		group: 'sites',
		secondary: true
	},
	{
		name: 'people',
		paths: [ '/people' ],
		module: 'my-sites/people',
		secondary: true,
		group: 'sites'
	},
	{
		name: 'plugins',
		paths: [ '/plugins' ],
		module: 'my-sites/plugins',
		secondary: true,
		group: 'sites'
	},
	{
		name: 'posts-pages',
		paths: [ '/pages' ],
		module: 'my-sites/pages',
		secondary: true,
		group: 'sites'
	},
	{
		name: 'posts-pages',
		paths: [ '/posts' ],
		module: 'my-sites/posts',
		secondary: true,
		group: 'sites'
	},
	{
		name: 'settings-writing',
		paths: [ '/settings/writing', '/settings/taxonomies' ],
		module: 'my-sites/site-settings/settings-writing',
		secondary: true,
		group: 'sites'
	},
	{
		name: 'settings-discussion',
		paths: [ '/settings/discussion' ],
		module: 'my-sites/site-settings/settings-discussion',
		secondary: true,
		group: 'sites'
	},
	{
		name: 'settings-traffic',
		paths: [ '/settings/traffic', '/settings/seo', '/settings/analytics' ],
		module: 'my-sites/site-settings/traffic',
		secondary: true,
		group: 'sites'
	},
	{
		name: 'settings',
		paths: [ '/settings' ],
		module: 'my-sites/site-settings',
		secondary: true,
		group: 'sites'
	},
	{
		name: 'sharing',
		paths: [ '/sharing' ],
		module: 'my-sites/sharing',
		secondary: true,
		group: 'sites'
	},
	{
		name: 'signup',
		paths: [ '/start', '/jetpack' ],
		module: 'signup',
		secondary: false,
		enableLoggedOut: true,
		isomorphic: true
	},
	{
		name: 'stats',
		paths: [ '/stats' ],
		module: 'my-sites/stats',
		secondary: true,
		group: 'sites'
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
		title: 'Themes'
	},
	{
		name: 'theme',
		paths: [ '/theme' ],
		module: 'my-sites/theme',
		enableLoggedOut: true,
		secondary: false,
		group: 'sites',
		isomorphic: true,
		title: 'Themes'
	},
	{
		name: 'upgrades',
		paths: [ '/domains', '/checkout' ],
		module: 'my-sites/upgrades',
		secondary: true,
		group: 'sites'
	},
	{
		name: 'plans',
		paths: [ '/plans' ],
		module: 'my-sites/plans',
		secondary: true,
		group: 'sites'
	},
	{
		name: 'accept-invite',
		paths: [ '/accept-invite' ],
		module: 'my-sites/invites',
		enableLoggedOut: true
	},
	{
		name: 'ads',
		paths: [ '/ads' ],
		module: 'my-sites/ads',
		secondary: true,
		group: 'sites'
	},
	{
		name: 'mailing-lists',
		paths: [ '/mailing-lists/unsubscribe' ],
		module: 'mailing-lists',
		enableLoggedOut: true
	}
];

sections.push( {
	name: 'post-editor',
	paths: [ '/post', '/page', '/edit' ],
	module: 'post-editor',
	group: 'editor',
	secondary: true
} );

sections.push( {
	name: 'account-recovery',
	paths: [ '/account-recovery' ],
	module: 'account-recovery',
	secondary: false,
	enableLoggedOut: true,
} );

// this MUST be the first section for /read paths so subsequent sections under /read can override settings
sections.push( {
	name: 'reader',
	paths: [ '/', '/read' ],
	module: 'reader',
	secondary: true,
	group: 'reader',
} );

sections.push( {
	name: 'reader',
	paths: [ '/read/feeds/[^\\/]+/posts/[^\\/]+', '/read/blogs/[^\\/]+/posts/[^\\/]+' ],
	module: 'reader/full-post',
	secondary: false,
	group: 'reader'
} );

sections.push( {
	name: 'reader',
	paths: [ '/recommendations/posts' ],
	module: 'reader/recommendations',
	secondary: true,
	group: 'reader'
} );

sections.push( {
	name: 'reader',
	paths: [ '/recommendations' ],
	module: 'reader/recommendations',
	secondary: true,
	group: 'reader'
} );

sections.push( {
	name: 'reader',
	paths: [ '/discover' ],
	module: 'reader/discover',
	secondary: true,
	group: 'reader'
} );

sections.push( {
	name: 'reader',
	paths: [ '/following' ],
	module: 'reader/following',
	secondary: true,
	group: 'reader'
} );

sections.push( {
	name: 'reader',
	paths: [ '/tags', '/tag' ],
	module: 'reader/tag-stream',
	secondary: true,
	group: 'reader'
} );

sections.push( {
	name: 'reader',
	paths: [ '/activities' ],
	module: 'reader/liked-stream',
	secondary: true,
	group: 'reader'
} );

sections.push( {
	name: 'reader',
	paths: [ '/read/search' ],
	module: 'reader/search',
	secondary: true,
	group: 'reader'
} );

sections.push( {
	name: 'reader',
	paths: [ '/read/list' ],
	module: 'reader/list',
	secondary: true,
	group: 'reader'
} );

sections.push( {
	name: 'help',
	paths: [ '/help' ],
	module: 'me/help',
	secondary: true,
	enableLoggedOut: true,
	group: 'me'
} );

sections.push( {
	name: 'login',
	paths: [ '/login' ],
	module: 'login',
	enableLoggedOut: true,
	secondary: false,
	isomorphic: true
} );

sections.push( {
	name: 'auth',
	paths: [ '/oauth-login', '/authorize', '/api/oauth/token' ],
	module: 'auth',
	secondary: false,
	enableLoggedOut: true
} );

sections.push( {
	name: 'posts-custom',
	paths: [ '/types' ],
	module: 'my-sites/types',
	secondary: true,
	group: 'sites'
} );

sections.push( {
	name: 'happychat',
	paths: [ '/me/chat' ],
	module: 'me/happychat',
	group: 'me',
	secondary: true
} );

module.exports = sections;
