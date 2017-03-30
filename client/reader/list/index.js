/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import controller from './controller';
import readerController from 'reader/controller';

import { makeLayout, render as clientRender } from 'controller';

export default function() {
	page(
	 '/read/list/:user/:list',
	 readerController.updateLastRoute,
	 readerController.sidebar,
	 controller.listListing,
	 makeLayout,
	 clientRender
	);
}
