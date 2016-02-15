var config = require( 'config' ),
	readerPaths;

var sections, editorPaths;

sections = [
	{
		name: 'customize',
		paths: [ '/customize' ],
		module: 'my-sites/customize'
	},
	{
		name: 'me',
		paths: [ '/me', '/purchases' ],
		module: 'me'
	},
	{
		name: 'media',
		paths: [ '/media' ],
		module: 'my-sites/media'
	},
	{
		name: 'menus',
		paths: [ '/menus' ],
		module: 'my-sites/menus'
	},
	{
		name: 'people',
		paths: [ '/people' ],
		module: 'my-sites/people'
	},
	{
		name: 'plugins',
		paths: [ '/plugins' ],
		module: 'my-sites/plugins'
	},
	{
		name: 'posts-pages',
		paths: [ '/pages' ],
		module: 'my-sites/pages'
	},
	{
		name: 'posts-pages',
		paths: [ '/posts' ],
		module: 'my-sites/posts'
	},
	{
		name: 'settings',
		paths: [ '/settings' ],
		module: 'my-sites/site-settings'
	},
	{
		name: 'sharing',
		paths: [ '/sharing' ],
		module: 'my-sites/sharing'
	},
	{
		name: 'signup',
		paths: [ '/start', '/phone', '/log-in', '/jetpack' ],
		module: 'signup',
		enableLoggedOut: true
	},
	{
		name: 'stats',
		paths: [ '/stats' ],
		module: 'my-sites/stats'
	},
	{
		name: 'themes',
		paths: [ '/design', '/themes' ],
		module: 'my-sites/themes',
		enableLoggedOut: config.isEnabled( 'manage/themes/logged-out' )
	},
	{
		name: 'upgrades',
		paths: [ '/domains', '/checkout' ],
		module: 'my-sites/upgrades'
	},
	{
		name: 'upgrades',
		paths: [ '/plans' ],
		module: 'my-sites/plans'
	}
];

if ( config.isEnabled( 'manage/ads' ) ) {
	sections.push( {
		name: 'ads',
		paths: [ '/ads' ],
		module: 'my-sites/ads'
	} );
}

if ( config.isEnabled( 'manage/drafts' ) ) {
	sections.push( {
		name: 'posts-pages',
		paths: [ '/drafts' ],
		module: 'my-sites/drafts'
	} );
}

if ( config.isEnabled( 'reader' ) ) {
	readerPaths = [ '/', '/read', '/fresh', '/activities', '/find-friends', '/tag' ];

	if ( config.isEnabled( 'reader/following-edit' ) ) {
		readerPaths.push( '/following' );
	}

	if ( config.isEnabled( 'reader/recommendations' ) ) {
		readerPaths.push( '/recommendations' );
		readerPaths.push( '/tags' );
	}

	if ( config.isEnabled( 'reader/discover' ) ) {
		readerPaths.push( '/discover' );
	}

	sections.push( {
		name: 'reader',
		paths: readerPaths,
		module: 'reader'
	} );
}

if ( config.isEnabled( 'post-editor' ) ) {
	editorPaths = [ '/post' ];

	if ( config.isEnabled( 'post-editor/pages' ) ) {
		editorPaths.push( '/page' );
	}

	sections.push( {
		name: 'post-editor',
		paths: editorPaths,
		module: 'post-editor'
	} );
}

if ( config.isEnabled( 'devdocs' ) ) {
	sections.push( {
		name: 'devdocs',
		paths: [ '/devdocs' ],
		module: 'devdocs',
		enableLoggedOut: true
	} );
}

if ( config.isEnabled( 'vip' ) ) {
	sections.push( {
		name: 'vip',
		paths: [ '/vip', '/vip/deploys', '/vip/billing', '/vip/support', '/vip/backups', '/vip/logs' ],
		module: 'vip'
	} );
}

if ( config.isEnabled( 'help' ) ) {
	sections.push( {
		name: 'help',
		paths: [ '/help' ],
		module: 'me/help'
	} );
}

if ( config.isEnabled( 'accept-invite' ) ) {
	sections.push( {
		name: 'accept-invite',
		paths: [ '/accept-invite' ],
		module: 'my-sites/invites',
		enableLoggedOut: true
	} );
}

if ( config.isEnabled( 'oauth' ) ) {
	sections.push( {
		name: 'auth',
		paths: [ '/login' ],
		module: 'auth',
		enableLoggedOut: true
	} );
}

if ( config.isEnabled( 'mailing-lists/unsubscribe' ) ) {
	sections.push( {
		name: 'mailing-lists',
		paths: [ '/mailing-lists' ],
		module: 'mailing-lists',
		enableLoggedOut: true
	} );
}

module.exports = sections;
