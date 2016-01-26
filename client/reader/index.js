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

function updateLastRoute( context, next ) {
	if ( lastRoute ) {
		context.lastRoute = lastRoute;
	}
	lastRoute = context.path;
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

		page( '/', updateLastRoute, controller.removePost, controller.sidebar, controller.following );

		page( '/read/blog/feed/:feed_id', updateLastRoute, controller.redirects, controller.removePost, controller.sidebar, controller.feedListing );
		page.exit( '/read/blog/feed/:feed_id', controller.resetTitle );

		page( '/read/post/feed/:feed/:post', updateLastRoute, controller.feedPost );
		page.exit( '/read/post/feed/:feed/:post', controller.resetTitle );

		page( '/read/blog/id/:blog_id', updateLastRoute, controller.redirects, controller.removePost, controller.sidebar, controller.blogListing );
		page( '/read/post/id/:blog/:post', updateLastRoute, controller.blogPost );
		page.exit( '/read/post/id/:blog/:post', controller.resetTitle );

		page( '/tag/:tag', updateLastRoute, controller.removePost, controller.sidebar, controller.tagListing );
	}

	if ( config.isEnabled( 'reader/teams' ) ) {
		page( '/read/a8c', updateLastRoute, controller.removePost, controller.sidebar, forceTeamA8C, controller.readA8C );
	}

	if ( config.isEnabled( 'reader/lists' ) ) {
		page( '/read/list/:user/:list', updateLastRoute, controller.removePost, controller.sidebar, controller.listListing );
	}

	if ( config.isEnabled( 'reader/list-management' ) ) {
		page( '/read/list/:user/:list/sites', updateLastRoute, controller.removePost, controller.sidebar, controller.listManagementSites );
		page( '/read/list/:user/:list/tags', updateLastRoute, controller.removePost, controller.sidebar, controller.listManagementTags );
		page( '/read/list/:user/:list/edit', updateLastRoute, controller.removePost, controller.sidebar, controller.listManagementDescriptionEdit );
		page( '/read/list/:user/:list/followers', updateLastRoute, controller.removePost, controller.sidebar, controller.listManagementFollowers );
	}

	if ( config.isEnabled( 'reader/activities' ) ) {
		page( '/activities/likes', controller.loadSubscriptions, updateLastRoute, controller.removePost, controller.sidebar, controller.likes );
	}

	if ( config.isEnabled( 'reader/following-edit' ) ) {
		page( '/following/edit', controller.loadSubscriptions, updateLastRoute, controller.removePost, controller.sidebar, controller.followingEdit );
	}

	if ( config.isEnabled( 'reader/recommendations' ) ) {
		page( '/recommendations', controller.loadSubscriptions, updateLastRoute, controller.removePost, controller.sidebar, controller.recommendedForYou );
		page( '/tags', controller.loadSubscriptions, updateLastRoute, controller.removePost, controller.sidebar, controller.recommendedTags );
	}

	if ( config.isEnabled( 'reader/discover' ) ) {
		page( '/discover', updateLastRoute, controller.removePost, controller.sidebar, controller.discover );
	}
};
