/** @format */

/**
 * Internal dependencies
 */

import page from 'page';
import config from 'config';
import meController from 'me/controller';
import helpController from './controller';
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	if ( config.isEnabled( 'help' ) ) {
		page(
			'/help',
			helpController.loggedOut,
			meController.sidebar,
			helpController.help,
			makeLayout,
			clientRender
		);
		page(
			'/help/contact',
			helpController.loggedOut,
			meController.sidebar,
			helpController.contact,
			makeLayout,
			clientRender
		);
	}

	if ( config.isEnabled( 'help/courses' ) ) {
		page(
			'/help/courses',
			helpController.loggedOut,
			meController.sidebar,
			helpController.courses,
			makeLayout,
			clientRender
		);
	}
}
