/**
 * External dependencies
 */
var page = require( 'page' );

/**
 * Internal dependencies
 */
var controller = require( 'my-sites/controller' ),
	statsController = require( './controller' ),
	config = require( 'config' );

module.exports = function() {
	if ( config.isEnabled( 'manage/stats' ) ) {

		// Stat Overview Page
		page( '/stats', controller.siteSelection, controller.navigation, statsController.overview );
		page( '/stats/day', controller.siteSelection, controller.navigation, statsController.overview );
		page( '/stats/week', controller.siteSelection, controller.navigation, statsController.overview );
		page( '/stats/month', controller.siteSelection, controller.navigation, statsController.overview );
		page( '/stats/year', controller.siteSelection, controller.navigation, statsController.overview );

		// Doc
		page( '/stats/graph', statsController.graph );

		// Stat Insights Page
		page( '/stats/insights/:site_id', controller.siteSelection, controller.navigation, statsController.insights );

		// Stat Site Pages
		page( '/stats/day/:site_id', controller.siteSelection, controller.navigation, statsController.site );
		page( '/stats/week/:site_id', controller.siteSelection, controller.navigation, statsController.site );
		page( '/stats/month/:site_id', controller.siteSelection, controller.navigation, statsController.site );
		page( '/stats/year/:site_id', controller.siteSelection, controller.navigation, statsController.site );

		// Stat Summary Pages
		page( '/stats/:module/:site_id', controller.siteSelection, controller.navigation, statsController.summary );
		page( '/stats/day/:module/:site_id', controller.siteSelection, controller.navigation, statsController.summary );
		page( '/stats/week/:module/:site_id', controller.siteSelection, controller.navigation, statsController.summary );
		page( '/stats/month/:module/:site_id', controller.siteSelection, controller.navigation, statsController.summary );
		page( '/stats/year/:module/:site_id', controller.siteSelection, controller.navigation, statsController.summary );

		// Stat Single Post Page
		page( '/stats/post/:post_id/:site_id', controller.siteSelection, controller.navigation, statsController.post );
		page( '/stats/page/:post_id/:site_id', controller.siteSelection, controller.navigation, statsController.post );

		// Stat Follows Page
		page( '/stats/follows/:follow_type/:site_id', controller.siteSelection, controller.navigation, statsController.follows );
		page( '/stats/follows/:follow_type/:page_num/:site_id', controller.siteSelection, controller.navigation, statsController.follows );

		// Reset first view
		if ( config.isEnabled( 'ui/first-view/reset-route' ) ) {
			page( '/stats/reset-first-view', statsController.resetFirstView );
		}

		// Anything else should require site-selection
		page( '/stats/(.*)', controller.siteSelection, controller.navigation, statsController.redirectToDefaultSitePage, controller.sites );
	}
};
