/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import mediaController from './controller';
import config from 'config';
import controller from 'my-sites/controller';

export default function() {
	if ( config.isEnabled( 'manage/media' ) ) {
		page( '/media', controller.siteSelection, controller.sites );
		page( '/media/:filter?/:domain', controller.siteSelection, controller.navigation, mediaController.media );
	}
}
