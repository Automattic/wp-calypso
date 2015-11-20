/**
 * External dependencies
 */
var page = require( 'page' );

/**
 * Internal dependencies
 */
var vipController = require( './controller' ),
	controller = require( 'my-sites/controller' ),
	config = require( 'config' );

module.exports = function() {
	if ( config.isEnabled( 'vip/deploys' ) ) {
		page( '/vip/deploys/:site_id', controller.siteSelection, controller.navigation, vipController.deploys );

		// we need to filter the sites list to only show VIP flagged sites
		page( '/vip/deploys', controller.siteSelection, controller.sites );
	}

	if ( config.isEnabled( 'vip/billing' ) ) {
		page( '/vip/billing/:site_id', controller.siteSelection, controller.navigation, vipController.billing );

		// we need to filter the sites list to only show VIP flagged sites
		page( '/vip/billing', controller.siteSelection, controller.sites );
	}

	if ( config.isEnabled( 'vip/support' ) ) {
		page( '/vip/support/:site_id', controller.siteSelection, controller.navigation, vipController.support );

		// show all support activity when no site is selected
		page( '/vip/support', controller.siteSelection, controller.navigation, vipController.support );
	}

	if ( config.isEnabled( 'vip/backups' ) ) {
		page( '/vip/backups/:site_id', controller.siteSelection, controller.navigation, vipController.backups );

		// we need to filter the sites list to only show VIP flagged sites
		page( '/vip/backups', controller.siteSelection, controller.sites );
	}

	if ( config.isEnabled( 'vip/logs' ) ) {
		page( '/vip/logs/:status?/:site_id', controller.siteSelection, controller.navigation, vipController.logs );

		// we need to filter the sites list to only show VIP flagged sites
		page( '/vip/logs', controller.siteSelection, controller.sites );
	}

	if ( config.isEnabled( 'vip' ) ) {
		page( '/vip/updates/:site_id', controller.navigation, controller.siteSelection, vipController.dashboard );

		// we need to filter the sites list to only show VIP flagged sites
		page( '/vip/updates', controller.siteSelection, controller.sites );

		page( '/vip', vipController.vip );
	}
};
