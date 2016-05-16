/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';
import controller from './controller';
import readerController from 'reader/controller';

export default function() {
	page( '/read/list/:user/:list', readerController.updateLastRoute, readerController.removePost, readerController.sidebar, controller.listListing );

	if ( config.isEnabled( 'reader/list-management' ) ) {
		page( '/read/list/:user/:list/sites', readerController.updateLastRoute, readerController.removePost, readerController.sidebar, controller.listManagementSites );
		page( '/read/list/:user/:list/tags', readerController.updateLastRoute, readerController.removePost, readerController.sidebar, controller.listManagementTags );
		page( '/read/list/:user/:list/edit', readerController.updateLastRoute, readerController.removePost, readerController.sidebar, controller.listManagementDescriptionEdit );
		page( '/read/list/:user/:list/followers', readerController.updateLastRoute, readerController.removePost, readerController.sidebar, controller.listManagementFollowers );
	}
}
