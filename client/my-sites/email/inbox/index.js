import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation } from 'calypso/my-sites/controller';
import controller from 'calypso/my-sites/email/inbox/controller';
import * as paths from 'calypso/my-sites/email/inbox/paths';

function registerMultiPage( { paths: givenPaths, handlers } ) {
	givenPaths.forEach( ( path ) => page( path, ...handlers ) );
}
const commonHandlers = [ navigation ];

export default function () {
	page( paths.inboxManagement() );
	registerMultiPage( {
		paths: [ paths.inboxManagement() ],
		handlers: [ ...commonHandlers, controller.inboxManagement, makeLayout, clientRender ],
	} );
}
