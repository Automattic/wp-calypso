/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import pagesController from './controller';
import config from 'config';
import controller from 'my-sites/controller';

export default function() {
	if ( config.isEnabled( 'manage/pages' ) ) {
		page( '/pages/:status?/:domain?', controller.siteSelection, controller.navigation, pagesController.pages );
	}
}
