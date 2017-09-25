/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import controller from 'my-sites/controller';

import mediaController from './controller';
import config from 'config';

module.exports = function() {
	if ( config.isEnabled( 'manage/media' ) ) {
		page( '/media', controller.siteSelection, controller.sites );
		page( '/media/:filter?/:domain', controller.siteSelection, controller.navigation, mediaController.media );
	}
};
