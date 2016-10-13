/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import controller from 'my-sites/controller';
import paladinController from './controller';
import config from 'config';

module.exports = function() {
	if ( config.isEnabled( 'paladin' ) ) {
		page( '/paladin', controller.siteSelection, controller.sites );
		page( '/paladin/:domain', controller.siteSelection, controller.navigation, paladinController.activate );
	}
};

