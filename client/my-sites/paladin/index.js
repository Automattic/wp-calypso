/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import paladinController from './controller';
import config from 'config';
import controller from 'my-sites/controller';

export default function() {
	if ( config.isEnabled( 'paladin' ) ) {
		page( '/paladin', controller.siteSelection, controller.sites );
		page( '/paladin/:domain', controller.siteSelection, controller.navigation, paladinController.activate );
	}
}

