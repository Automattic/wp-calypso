var config = require( 'config' ),
	readerPaths;

var sections;

sections = [
	{
		name: 'customize',
		paths: [ '/customize' ],
		module: 'my-sites/customize',
		group: 'sites'
	},
	{
		name: 'post-editor',
		paths: [ '/post', '/page' ],
		module: 'post-editor',
		group: 'editor'
	},
	{
		name: 'me',
		paths: [ '/me', '/purchases' ],
		module: 'me',
		group: 'me'
	},
	{
		name: 'media',
		paths: [ '/media' ],
		module: 'my-sites/media',
		group: 'sites'
	},
	{
		name: 'menus',
		paths: [ '/menus' ],
		module: 'my-sites/menus',
		group: 'sites'
	},
	{
		name: 'people',
		paths: [ '/people' ],
		module: 'my-sites/people',
		group: 'sites'
	},
	{
		name: 'plugins',
		paths: [ '/plugins' ],
		module: 'my-sites/plugins',
		group: 'sites'
	},
	{
		name: 'posts-pages',
		paths: [ '/pages' ],
		module: 'my-sites/pages',
		group: 'sites'
	},
	{
		name: 'posts-pages',
		paths: [ '/posts' ],
		module: 'my-sites/posts',
		group: 'sites'
	},
	{
		name: 'settings',
		paths: [ '/settings' ],
		module: 'my-sites/site-settings',
		group: 'sites'
	},
	{
		name: 'sharing',
		paths: [ '/sharing' ],
		module: 'my-sites/sharing',
		group: 'sites'
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
		module: 'my-sites/stats',
		group: 'sites'
	},
	{
		name: 'themes',
		paths: [ '/design', '/theme' ],
		module: 'my-sites/themes',
		enableLoggedOut: config.isEnabled( 'manage/themes/logged-out' ),
		routing: config( 'env' ) === 'development' ? 'isomorphic' : '',
		group: 'sites'
	},
	{
		name: 'upgrades',
		paths: [ '/domains', '/checkout' ],
		module: 'my-sites/upgrades',
		group: 'sites'
	},
	{
		name: 'upgrades',
		paths: [ '/plans' ],
		module: 'my-sites/plans',
		group: 'sites'
	}
];

if ( config.isEnabled( 'manage/ads' ) ) {
	sections.push( {
		name: 'ads',
		paths: [ '/ads' ],
		module: 'my-sites/ads',
		group: 'sites'
	} );
}

if ( config.isEnabled( 'manage/drafts' ) ) {
	sections.push( {
		name: 'posts-pages',
		paths: [ '/drafts' ],
		module: 'my-sites/drafts',
		group: 'sites'
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
		module: 'reader',
		group: 'reader'
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
		module: 'me/help',
		group: 'me'
	} );
}

if ( config.isEnabled( 'accept-invite' ) ) {
	sections.push( {
		name: 'accept-invite',
		paths: [ '/accept-invite' ],
		module: 'my-sites/invites',
		enableLoggedOut: true,
		group: 'sites'
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

if ( config.isEnabled( 'manage/custom-post-types' ) ) {
	sections.push( {
		name: 'posts-custom',
		paths: [ '/types' ],
		module: 'my-sites/types'
	} );
}

module.exports = sections;
