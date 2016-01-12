/**
 * External dependencies
 */
var page = require( 'page' );

/**
 * Internal dependencies
 */
var adTracking = require( 'analytics/ad-tracking' ),
	config = require( 'config' ),
	controller = require( 'my-sites/controller' ),
	paths = require( './paths' ),
	plansController = require( './controller' );

module.exports = function() {
	if ( config.isEnabled( 'manage/plans' ) ) {
		page(
			'/plans',
			adTracking.retarget,
			controller.siteSelection,
			controller.sites
		);

		page(
			'/plans/compare',
			adTracking.retarget,
			controller.siteSelection,
			controller.navigation,
			plansController.plansCompare
		);

		page(
			'/plans/compare/:domain',
			adTracking.retarget,
			controller.siteSelection,
			controller.navigation,
			plansController.plansCompare
		);

		page(
			'/plans/select/:plan/:domain',
			adTracking.retarget,
			controller.siteSelection,
			plansController.redirectToCheckout
		);

		page(
			paths.plansDestination(),
			adTracking.retarget,
			controller.siteSelection,
			controller.navigation,
			plansController.plans
		);
	}
};
