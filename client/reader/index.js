/**
 * External dependencies
 */
var page = require( 'page' );

/**
 * Internal dependencies
 */
var controller = require( './controller' ),
	config = require( 'config' );

var lastRoute = null;

function saveLastRoute( context, next ) {
	lastRoute = context.path;
	next();
}

function setLastRoute( context, next ) {
	if ( lastRoute ) {
		context.lastRoute = lastRoute;
	}
	next();
}

function forceTeamA8C( context, next ) {
	context.params.team = 'a8c';
	next();
}

module.exports = function() {
	if ( config.isEnabled( 'reader' ) ) {
		page( '/', controller.loadSubscriptions );
		page( '/read/*', controller.loadSubscriptions );

		page( '/', saveLastRoute, controller.removePost, controller.sidebar, controller.following );

		page( '/read/blog/feed/:feed_id', saveLastRoute, controller.redirects, controller.removePost, controller.sidebar, controller.feedListing );
		page.exit( '/read/blog/feed/:feed_id', controller.resetTitle );

		page( '/read/post/feed/:feed/:post', setLastRoute, controller.feedPost );
		page.exit( '/read/post/feed/:feed/:post', controller.resetTitle, controller.removePost );

		page( '/read/blog/id/:blog_id', saveLastRoute, controller.redirects, controller.removePost, controller.sidebar, controller.blogListing );
		page( '/read/post/id/:blog/:post', setLastRoute, controller.blogPost );
		page.exit( '/read/post/id/:blog/:post', controller.resetTitle, controller.removePost );

		page( '/tag/:tag', saveLastRoute, controller.removePost, controller.sidebar, controller.tagListing );
	}

	if ( config.isEnabled( 'reader/teams' ) ) {
		page( '/read/a8c', saveLastRoute, controller.removePost, controller.sidebar, forceTeamA8C, controller.readA8C );
	}

	if ( config.isEnabled( 'reader/lists' ) ) {
		page( '/read/list/:user/:list', saveLastRoute, controller.removePost, controller.sidebar, controller.listListing );
	}

	if ( config.isEnabled( 'reader/list-management' ) ) {
		page( '/read/list/:user/:list/edit', saveLastRoute, controller.removePost, controller.sidebar, controller.listManagementContents );
		page( '/read/list/:user/:list/description/edit', saveLastRoute, controller.removePost, controller.sidebar, controller.listManagementDescriptionEdit );
		page( '/read/list/:user/:list/followers', saveLastRoute, controller.removePost, controller.sidebar, controller.listManagementFollowers );
	}

	if ( config.isEnabled( 'reader/activities' ) ) {
		page( '/activities/likes', controller.loadSubscriptions, saveLastRoute, controller.removePost, controller.sidebar, controller.likes );
	}

	if ( config.isEnabled( 'reader/following-edit' ) ) {
		page( '/following/edit', controller.loadSubscriptions, saveLastRoute, controller.removePost, controller.sidebar, controller.followingEdit );
	}

	if ( config.isEnabled( 'reader/recommendations' ) ) {
		page( '/recommendations', controller.loadSubscriptions, saveLastRoute, controller.removePost, controller.sidebar, controller.recommendedForYou );
		page( '/tags', controller.loadSubscriptions, saveLastRoute, controller.removePost, controller.sidebar, controller.recommendedTags );
	}

	if ( config.isEnabled( 'reader/discover' ) ) {
		page( '/discover', setLastRoute, controller.removePost, controller.sidebar, controller.discover );
	}
};
