/**
 * Internal dependencies
 */
import * as helpController from './controller';
import config from 'config';
import page from 'page';
import { makeLayout, render as clientRender } from 'controller';
import { sidebar } from 'me/controller';

export default function () {
	if ( config.isEnabled( 'help' ) ) {
		page(
			'/help',
			helpController.loggedOut,
			sidebar,
			helpController.help,
			makeLayout,
			clientRender
		);
		page(
			'/help/contact',
			helpController.loggedOut,
			sidebar,
			helpController.contact,
			makeLayout,
			clientRender
		);
	}

	if ( config.isEnabled( 'help/courses' ) ) {
		page(
			'/help/courses',
			helpController.loggedOut,
			sidebar,
			helpController.courses,
			makeLayout,
			clientRender
		);
	}
}
