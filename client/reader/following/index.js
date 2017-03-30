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

import { makeLayout, render as clientRender } from 'controller';

export default function() {
	page(
	 '/following/*',
	 readerController.loadSubscriptions,
	 readerController.initAbTests,
	 makeLayout,
	 clientRender
	);
	page(
	 '/following/edit',
	 readerController.updateLastRoute,
	 readerController.sidebar,
	 controller.followingEdit,
	 makeLayout,
	 clientRender
	);
	if ( config.isEnabled( 'reader/following-manage-refresh' ) ) {
		page(
		 '/following/manage',
		 readerController.updateLastRoute,
		 readerController.sidebar,
		 controller.followingManage,
		 makeLayout,
		 clientRender
		);
	}
}
