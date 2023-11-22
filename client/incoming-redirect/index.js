import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import controller from './controller';
import * as paths from './paths';

export default function () {
	page(
		paths.emailManagementTitanExternal( ':mode' ),
		controller.emailTitanAddMailboxes,
		makeLayout,
		clientRender
	);

	page( paths.incomingRedirectRoot + '/*', controller.notFound, makeLayout, clientRender );
	page( paths.incomingRedirectRoot, controller.notFound, makeLayout, clientRender );
}
