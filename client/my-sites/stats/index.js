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
		page(
		    '/stats',
			controller.siteSelection,
			controller.navigation,
			statsController.overview,
			makeLayout,
			clientRender
		);
		page(
		    '/stats/day',
			controller.siteSelection,
			controller.navigation,
			statsController.overview,
			makeLayout,
			clientRender
		);
		page(
		    '/stats/week',
			controller.siteSelection,
			controller.navigation,
			statsController.overview,
			makeLayout,
			clientRender
		);
		page(
		    '/stats/month',
			controller.siteSelection,
			controller.navigation,
			statsController.overview,
			makeLayout,
			clientRender
		);
		page(
		    '/stats/year',
			controller.siteSelection,
			controller.navigation,
			statsController.overview,
			makeLayout,
			clientRender
		);

		// Stat Insights Page
		page(
		    '/stats/insights/:site_id',
			controller.siteSelection,
			controller.navigation,
			statsController.insights,
			makeLayout,
			clientRender
		);

		// Stat Site Pages
		page(
		    '/stats/day/:site_id',
			controller.siteSelection,
			controller.navigation,
			statsController.site,
			makeLayout,
			clientRender
		);
		page(
		    '/stats/week/:site_id',
			controller.siteSelection,
			controller.navigation,
			statsController.site,
			makeLayout,
			clientRender
		);
		page(
		    '/stats/month/:site_id',
			controller.siteSelection,
			controller.navigation,
			statsController.site,
			makeLayout,
			clientRender
		);
		page(
		    '/stats/year/:site_id',
			controller.siteSelection,
			controller.navigation,
			statsController.site,
			makeLayout,
			clientRender
		);

		// Stat Summary Pages
		page(
		    '/stats/:module/:site_id',
			controller.siteSelection,
			controller.navigation,
			statsController.summary,
			makeLayout,
			clientRender
		);
		page(
		    '/stats/day/:module/:site_id',
			controller.siteSelection,
			controller.navigation,
			statsController.summary,
			makeLayout,
			clientRender
		);
		page(
		    '/stats/week/:module/:site_id',
			controller.siteSelection,
			controller.navigation,
			statsController.summary,
			makeLayout,
			clientRender
		);
		page(
		    '/stats/month/:module/:site_id',
			controller.siteSelection,
			controller.navigation,
			statsController.summary,
			makeLayout,
			clientRender
		);
		page(
		    '/stats/year/:module/:site_id',
			controller.siteSelection,
			controller.navigation,
			statsController.summary,
			makeLayout,
			clientRender
		);

		// Stat Single Post Page
		page(
		    '/stats/post/:post_id/:site_id',
			controller.siteSelection,
			controller.navigation,
			statsController.post,
			makeLayout,
			clientRender
		);
		page(
		    '/stats/page/:post_id/:site_id',
			controller.siteSelection,
			controller.navigation,
			statsController.post,
			makeLayout,
			clientRender
		);

		// Stat Follows Page
		page(
		    '/stats/follows/comment/:site_id',
			controller.siteSelection,
			controller.navigation,
			statsController.follows,
			makeLayout,
			clientRender
		);
		page(
		    '/stats/follows/comment/:page_num/:site_id',
			controller.siteSelection,
			controller.navigation,
			statsController.follows,
			makeLayout,
			clientRender
		);

		// Reset first view
		if ( config.isEnabled( 'ui/first-view/reset-route' ) ) {
			page(
			    '/stats/reset-first-view',
				statsController.resetFirstView,
				makeLayout,
				clientRender
			);
		}

		// Anything else should require site-selection
		page(
		    '/stats/(.*)',
			controller.siteSelection,
			controller.navigation,
			statsController.redirectToDefaultSitePage,
			controller.sites,
			makeLayout,
			clientRender
		);
	}
};
