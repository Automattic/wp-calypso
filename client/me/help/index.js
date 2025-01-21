import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar } from 'calypso/me/controller';
import * as helpController from './controller';

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
			helpController.contactRedirect,
			makeLayout,
			clientRender
		);
	}

	page( '/me/chat', sidebar, helpController.contactRedirect, makeLayout, clientRender );
}
