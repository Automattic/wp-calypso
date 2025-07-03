import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import * as helpController from './controller';

export default function () {
	// /help page has been dismissed
	if ( config.isEnabled( 'help' ) ) {
		page( '/help', helpController.helpRedirect );
		page( '/help/contact', helpController.helpRedirect );
	}

	page( '/me/chat', helpController.helpRedirect );
}
