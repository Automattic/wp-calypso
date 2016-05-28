/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import controller from './controller';
import readerController from 'reader/controller';

export default function() {
	page( '/following/*', readerController.loadSubscriptions, readerController.initAbTests );
	page( '/following/edit', readerController.updateLastRoute, readerController.removePost, readerController.sidebar, controller.followingEdit );
}
