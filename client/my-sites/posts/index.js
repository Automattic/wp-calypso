/**
 * External Dependencies
 */
var page = require( 'page' );

/**
 * Internal Dependencies
 */
var removeOverlay = require( 'remove-overlay' ),
	controller = require( 'my-sites/controller' ),
	postsController = require( './controller' );

module.exports = function() {
	page( '/posts/:author?/:status?/:domain?',
		controller.siteSelection,
		controller.navigation,
		removeOverlay,
		postsController.posts
	);
};
