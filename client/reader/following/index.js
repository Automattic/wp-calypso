/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import controller from './controller';
import readerController from 'reader/controller';
import config from 'config';

export default function() {
    page('/following/*', readerController.loadSubscriptions, readerController.initAbTests);
    page(
        '/following/edit',
        readerController.updateLastRoute,
        readerController.sidebar,
        controller.followingEdit
    );
    if (config.isEnabled('reader/following-manage-refresh')) {
        page(
            '/following/manage',
            readerController.updateLastRoute,
            readerController.sidebar,
            controller.followingManage
        );
    }
}
